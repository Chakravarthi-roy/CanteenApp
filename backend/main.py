from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import tables
from database import engine
from routes import auth, orders, products, users

MyApp = FastAPI()

MyApp.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MyApp.include_router(users.router)
MyApp.include_router(products.router)
MyApp.include_router(orders.router)
MyApp.include_router(auth.router)

@MyApp.get('/')
def home():
    return {'message': 'Hello Milma'}

tables.Base.metadata.create_all(bind=engine)