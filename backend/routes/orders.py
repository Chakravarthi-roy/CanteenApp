from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field
from typing import List
from datetime import date, datetime, time, timezone, timedelta

from db.tables import Order, OrderItem, Product, User
from database import get_db
from CRUD.create import createOrder
from CRUD.update import updateOrder
from db.schemas import OrderCreate, OrderUpdate, OrderDisplay
from websocket import manager

from auth.dependencies import get_current_admin

IST = timezone(timedelta(hours=5, minutes=30))

router = APIRouter(
    prefix='/orders',
    tags=['orders']
)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Request body schema for updating item quantity
class OrderItemQuantityUpdate(BaseModel):
    quantity: int = Field(..., gt=0, description="Must be at least 1")

def formatOrder(order):
    return {
        "user_id": order.user_id,
        "id": order.id,
        "order_time": order.order_time,
        "total_amount": order.total_amount,
        "prep_status": order.prep_status,
        "delivery_status": order.delivery_status,
        "user": {
            "id": order.user.id,
            "username": order.user.username,
            "full_name": order.user.full_name
        } if order.user else None,
        "order_items": [
            {
                "id": item.id,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_order": item.price_at_order,
                "product_name": item.product_related.product_name if item.product_related else "Unknown"
            }
            for item in order.order_items
        ]
    }

def getOrders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).options(
        joinedload(Order.order_items).joinedload(OrderItem.product_related)
    ).filter(
        Order.prep_status.in_(["pending", "ready"]),
        Order.delivery_status == "pending"
    ).offset(skip).limit(limit).all()

def getOrder(db: Session, order_id: int):
    return db.query(Order).options(
        joinedload(Order.order_items).joinedload(OrderItem.product_related)
    ).filter(Order.id == order_id).first()

# def addItem(db: Session, order_id: int, item_data: OrderItemCreate):
#     db_order = db.query(Order).filter(Order.id == order_id).first()
#     if not db_order:
#         raise ValueError(f"Order ID {order_id} not found")

#     product = db.query(Product).filter(Product.id == item_data.product_id).first()
#     if not product:
#         raise ValueError(f"Product ID {item_data.product_id} not found")

#     existing_item = db.query(OrderItem).filter(
#         OrderItem.order_id == order_id,
#         OrderItem.product_id == item_data.product_id
#     ).first()

#     try:
#         if existing_item:
#             old_total = existing_item.quantity * existing_item.price_at_order
#             existing_item.quantity += item_data.quantity
#             new_total = existing_item.quantity * existing_item.price_at_order
#             db_order.total_amount += (new_total - old_total)
#         else:
#             price_at_order = product.price
#             new_item = OrderItem(
#                 order_id=order_id,
#                 product_id=item_data.product_id,
#                 quantity=item_data.quantity,
#                 price_at_order=price_at_order
#             )
#             db.add(new_item)
#             db.flush()
#             db_order.total_amount += (item_data.quantity * price_at_order)
#         db.commit()
#         db.refresh(db_order)
#         return existing_item or new_item
#     except IntegrityError as e:
#         db.rollback()
#         raise ValueError(f"Failed to add item: {str(e)}")

@router.post("/", response_model=OrderDisplay, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    try:
        order = createOrder(db, order_data)
        formatted = formatOrder(order)
        await manager.broadcast({
            "event": "new_order",
            "order_id": order.id,
            **formatted
        })
        return formatted
    except ValueError as e:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=str(e))

@router.get("/", response_model=List[OrderDisplay])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    orders = getOrders(db, skip=skip, limit=limit)
    return [formatOrder(order) for order in orders]

@router.get("/history", response_model=dict)
def get_order_history(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    start_date: date = None,
    end_date: date = None
):
    try:
        query = db.query(Order).options(
            joinedload(Order.user),
            joinedload(Order.order_items).joinedload(OrderItem.product_related)
        ).filter(Order.delivery_status == "delivered")

        if start_date and end_date:
            if start_date > end_date:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date cannot be after end_date")
            IST = timezone(timedelta(hours=5, minutes=30))
            query = query.filter(
                Order.order_time >= datetime.combine(start_date, time.min).replace(tzinfo=IST),
                Order.order_time <= datetime.combine(end_date, time.max).replace(tzinfo=IST)
            )

        orders = query.order_by(Order.order_time.desc()).all()
        total_income = sum(order.total_amount for order in orders)

        return {
            "total_income": float(total_income),
            "total_orders": len(orders),
            "orders": [
                {
                    "id": o.id,
                    "user": o.user.full_name or o.user.username,
                    "order_time": str(o.order_time),
                    "total_amount": float(o.total_amount),
                    "items": [
                        {
                            "product": item.product_related.product_name if item.product_related else "Unknown",
                            "quantity": item.quantity,
                            "price_at_order": float(item.price_at_order)
                        }
                        for item in o.order_items
                    ]
                }
                for o in orders
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/cancelled", response_model=dict)
def get_cancelled_orders(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    start_date: date = None,
    end_date: date = None
):
    try:
        query = db.query(Order).options(
            joinedload(Order.user),
            joinedload(Order.order_items).joinedload(OrderItem.product_related)
        ).filter(Order.prep_status == "cancelled")

        if start_date and end_date:
            IST = timezone(timedelta(hours=5, minutes=30))
            query = query.filter(
                Order.order_time >= datetime.combine(start_date, time.min).replace(tzinfo=IST),
                Order.order_time <= datetime.combine(end_date, time.max).replace(tzinfo=IST)
            )

        orders = query.order_by(Order.order_time.desc()).all()

        return {
            "total_cancelled": len(orders),
            "orders": [
                {
                    "id": o.id,
                    "user": o.user.full_name or o.user.username,
                    "order_time": str(o.order_time),
                    "total_amount": float(o.total_amount),
                    "items": [
                        {
                            "product": item.product_related.product_name if item.product_related else "Unknown",
                            "quantity": item.quantity,
                            "price_at_order": float(item.price_at_order)
                        }
                        for item in o.order_items
                    ]
                }
                for o in orders
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    
@router.get("/{order_id}", response_model=OrderDisplay)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    db_order = getOrder(db, order_id)
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order ID {order_id} not found")
    return formatOrder(db_order)

@router.patch("/{order_id}", response_model=OrderDisplay)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    try:
        updateOrder(db, order_id, order_update)
        # Re-fetch with full relations so formatOrder works correctly
        updated_order = getOrder(db, order_id)
        if not updated_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order ID {order_id} not found")
        return formatOrder(updated_order)
    except HTTPException:
        raise
    except ValueError as e:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=str(e))

@router.patch("/{order_id}/cancel", response_model=OrderDisplay)
def cancel_order(order_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    # Fetch with full relations upfront so we can access items and format response
    db_order = getOrder(db, order_id)
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order ID {order_id} not found")
    if db_order.prep_status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending orders can be cancelled")
    try:
        # Restore stock for each item in the order
        for item in db_order.order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.stock_count is not None:
                product.stock_count += item.quantity
                if product.stock_count > 0:
                    product.is_available = True
        db_order.prep_status = "cancelled"
        db_order.delivery_status = "cancelled"
        db.commit()
        # Re-fetch after commit so all changes are reflected
        refreshed = getOrder(db, order_id)
        return formatOrder(refreshed)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# @router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_order(order_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
#     try:
#         deleteOrder(db, order_id)
#     except ValueError as e:
#         status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
#         raise HTTPException(status_code=status_code, detail=str(e))

# @router.post("/{order_id}/items", response_model=OrderItemDisplay, status_code=status.HTTP_201_CREATED)
# def add_item_to_order(order_id: int, item_data: OrderItemCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
#     try:
#         return addItem(db, order_id, item_data)
#     except ValueError as e:
#         status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
#         raise HTTPException(status_code=status_code, detail=str(e))

# @router.put("/{order_id}/items/{item_id}", response_model=OrderItemDisplay)
# def update_order_item(order_id: int, item_id: int, body: OrderItemQuantityUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
#     try:
#         db_item = updateOrderItem(db, order_id, item_id, body.quantity)
#         if not db_item:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order item not found in this order")
#         return db_item
#     except ValueError as e:
#         status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
#         raise HTTPException(status_code=status_code, detail=str(e))

# @router.delete("/{order_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
# def remove_item_from_order(order_id: int, item_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
#     try:
#         deleteOrderItem(db, order_id, item_id)
#     except ValueError as e:
#         status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
#         raise HTTPException(status_code=status_code, detail=str(e))