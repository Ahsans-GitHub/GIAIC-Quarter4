import json
import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

USERS_DB_FILE = "users_db.json"

origins = [
    "http://localhost",
    "http://localhost:3000",  # Next.js frontend default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user database
users_db = {}

def load_users_db():
    global users_db
    if os.path.exists(USERS_DB_FILE):
        with open(USERS_DB_FILE, "r") as f:
            users_db = json.load(f)
    else:
        # Initial data if file doesn't exist
        users_db = {
            "Ali": {"pin": "0001", "balance": 50000, "phone_number": "9231"},
            "Ahsan": {"pin": "0002", "balance": 100000, "phone_number": "4258"},
            "Shahid": {"pin": "0003", "balance": 150000, "phone_number": "5018"},
        }
        save_users_db() # Save initial data to file

def save_users_db():
    with open(USERS_DB_FILE, "w") as f:
        json.dump(users_db, f, indent=4)

# Load the database when the application starts
load_users_db()

class DepositRequest(BaseModel):
    sender_name: str
    sender_pin: str
    recipient_phone: str
    amount: float

class WithdrawalRequest(BaseModel):
    username: str
    pin: str
    amount: float

class CreateAccountRequest(BaseModel):
    username: str
    pin: str
    phone_number: str

@app.get("/authenticate")
async def authenticate_user(username: str, pin: str):
    user = users_db.get(username)
    if not user or user["pin"] != pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"message": f"Authentication successful for {username}"}

@app.get("/bank_balance")
async def get_bank_balance(username: str):
    user = users_db.get(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"username": username, "balance": user["balance"]}

@app.post("/deposit")
async def deposit_money(request: DepositRequest):
    sender = users_db.get(request.sender_name)
    if not sender or sender["pin"] != request.sender_pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid sender credentials")

    if sender["balance"] < request.amount:
        max_send_amount = sender["balance"]
        return {
            "message": f"Your sending amount is {request.amount} but your balance is {sender['balance']}. "
                       f"You should deduct {request.amount - max_send_amount} and enter {max_send_amount} to send the max amount.",
            "current_balance": sender["balance"]
        }

    recipient = None
    recipient_name = None
    for name, data in users_db.items():
        if data["phone_number"] == request.recipient_phone:
            recipient = data
            recipient_name = name
            break

    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient phone number not found")

    sender["balance"] -= request.amount
    recipient["balance"] += request.amount

    save_users_db()

    return {
        "message": f"Successfully transferred {request.amount} from {request.sender_name} to {recipient_name}.",
        "sender_new_balance": sender["balance"],
        "recipient_new_balance": recipient["balance"]
    }

@app.post("/withdrawal")
async def withdraw_money(request: WithdrawalRequest):
    user = users_db.get(request.username)
    if not user or user["pin"] != request.pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user["balance"] < request.amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

    user["balance"] -= request.amount
    save_users_db()
    return {"message": f"Successfully withdrew {request.amount} from {request.username}.",
            "new_balance": user["balance"]}

@app.post("/create_account")
async def create_account(request: CreateAccountRequest):
    if request.username in users_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    # Check if phone number already exists
    for user_data in users_db.values():
        if user_data["phone_number"] == request.phone_number:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number already registered")

    users_db[request.username] = {"pin": request.pin, "balance": 0, "phone_number": request.phone_number}
    save_users_db()
    return {"message": f"Account for {request.username} created successfully with an initial balance of 0"}