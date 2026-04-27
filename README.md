# Restaurant Management System DBMS Project

This project is a complete full-stack DBMS application built with:

- React + Tailwind CSS frontend
- Node.js + Express backend
- MySQL database

The backend is designed around your existing SQL files:

- [2_3_DDL.sql](/Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_3_DDL.sql)
- [2_4_DML.sql](/Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_4_DML.sql)

The schema is not redesigned. Table names, field names, enum values, views, and relationships are used exactly as defined in the SQL.

Advanced DBMS enhancements are also included in:

- [2_5_ADVANCED_FEATURES.sql](/Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_5_ADVANCED_FEATURES.sql)

## Project Name

RestroSync

## Folder Structure

```text
Restaurant_DBMS_Project/
├── 2_3_DDL.sql
├── 2_4_DML.sql
├── README.md
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── config/
│       ├── pages/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
└── server/
    ├── .env.example
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── scripts/
        ├── services/
        └── utils/
```

## Backend Features

- MySQL connection pooling with `mysql2/promise`
- MVC-style organization using routes, controllers, and models
- CRUD APIs for all 12 tables
- Read-only endpoints for SQL views
- Transactional order placement workflow
- Analytics endpoints for KPIs, trends, category sales, top items, and peak hours
- CSV report export endpoints
- Backend validation for schema-matched payloads
- Audit trail support
- Proper async/await and centralized error handling
- Database initialization script that runs your SQL files exactly as provided

## Frontend Features

- Sidebar navigation for all entities
- Dashboard showing entity counts and SQL views
- Business analytics page
- Kitchen and order workflow page
- Search, sorting, status filtering, and CSV export
- Reusable CRUD form and table components
- Axios API integration
- Responsive Tailwind CSS UI

## Step-by-Step Setup

### 1. MySQL prerequisites

Make sure MySQL Server and the MySQL CLI are installed and running.

Check versions:

```bash
mysql --version
node --version
npm --version
```

### 2. Configure backend environment

Create `server/.env` using the example below:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=RestaurantDB
CLIENT_URL=http://localhost:5173
MYSQL_BIN=mysql
```

### 3. Configure frontend environment

Create `client/.env` using:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:5001
```

### 4. Install dependencies

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/server
npm install
```

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/client
npm install
```

### 5. Load the SQL files into MySQL

Recommended automated method through the backend:

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/server
npm run db:init
```

What this does:

- Runs [2_3_DDL.sql](/Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_3_DDL.sql) first
- Runs [2_4_DML.sql](/Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_4_DML.sql) next
- Uses the MySQL CLI so `DELIMITER`, triggers, views, and other SQL statements remain unchanged

### 6. Apply the advanced DBMS enhancement layer

This step adds:

- indexes for faster lookup
- `AUDIT_LOG`
- additional views
- stored procedures
- triggers for stock and audit handling

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/server
npm run db:enhance
```

### 7. Start the backend

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/server
npm run dev
```

### 8. Start the frontend

```bash
cd /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:5001/api
```

## How to Run SQL Files Manually in MySQL

If you want to run them yourself instead of using `npm run db:init`:

```bash
mysql -u root -p < /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_3_DDL.sql
mysql -u root -p < /Users/aleeshabhave/Desktop/Restaurant_DBMS_Project/2_4_DML.sql
```

## API Routes

All routes use the `/api` prefix.

### Health and metadata

- `GET /api/health`
- `GET /api/meta/entities`

### CRUD entity routes

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:customer_id`
- `PUT /api/customers/:customer_id`
- `DELETE /api/customers/:customer_id`

- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:employee_id`
- `PUT /api/employees/:employee_id`
- `DELETE /api/employees/:employee_id`

- `GET /api/menu-items`
- `POST /api/menu-items`
- `GET /api/menu-items/:menu_item_id`
- `PUT /api/menu-items/:menu_item_id`
- `DELETE /api/menu-items/:menu_item_id`

- `GET /api/inventory-items`
- `POST /api/inventory-items`
- `GET /api/inventory-items/:inventory_item_id`
- `PUT /api/inventory-items/:inventory_item_id`
- `DELETE /api/inventory-items/:inventory_item_id`

- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:supplier_id`
- `PUT /api/suppliers/:supplier_id`
- `DELETE /api/suppliers/:supplier_id`

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:order_id`
- `PUT /api/orders/:order_id`
- `DELETE /api/orders/:order_id`

- `GET /api/order-items`
- `POST /api/order-items`
- `GET /api/order-items/:order_item_id`
- `PUT /api/order-items/:order_item_id`
- `DELETE /api/order-items/:order_item_id`

- `GET /api/bills`
- `POST /api/bills`
- `GET /api/bills/:bill_id`
- `PUT /api/bills/:bill_id`
- `DELETE /api/bills/:bill_id`

- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/recipes/:recipe_id`
- `PUT /api/recipes/:recipe_id`
- `DELETE /api/recipes/:recipe_id`

- `GET /api/recipe-ingredients`
- `POST /api/recipe-ingredients`
- `GET /api/recipe-ingredients/:recipe_id/:inventory_item_id`
- `PUT /api/recipe-ingredients/:recipe_id/:inventory_item_id`
- `DELETE /api/recipe-ingredients/:recipe_id/:inventory_item_id`

- `GET /api/purchase-orders`
- `POST /api/purchase-orders`
- `GET /api/purchase-orders/:purchase_order_id`
- `PUT /api/purchase-orders/:purchase_order_id`
- `DELETE /api/purchase-orders/:purchase_order_id`

- `GET /api/purchase-order-items`
- `POST /api/purchase-order-items`
- `GET /api/purchase-order-items/:purchase_order_item_id`
- `PUT /api/purchase-order-items/:purchase_order_item_id`
- `DELETE /api/purchase-order-items/:purchase_order_item_id`

### SQL view routes

- `GET /api/views/customer-order-summary`
- `GET /api/views/low-stock-inventory`

### Analytics routes

- `GET /api/analytics/dashboard`

### Workflow routes

- `GET /api/workflow/kitchen`
- `GET /api/workflow/audit-log`
- `POST /api/workflow/place-order`
- `PATCH /api/workflow/orders/:order_id/status`

### Report routes

- `GET /api/reports/orders.csv`
- `GET /api/reports/customers.csv`

## Sample API Requests

### 1. Get all customers

```bash
curl http://localhost:5000/api/customers
```

### 2. Add a new customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vikram Das",
    "phone": "9876501234",
    "email": "vikram@gmail.com",
    "street": "21 Lake View",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600020"
  }'
```

### 3. Update an employee

```bash
curl -X PUT http://localhost:5000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Karthik Raj",
    "role": "Chef",
    "phone": "9000011111",
    "email": "karthik.chef@gmail.com",
    "salary": 42000,
    "join_date": "2023-06-15"
  }'
```

### 4. Delete a menu item

```bash
curl -X DELETE http://localhost:5000/api/menu-items/10
```

### 5. Add a recipe ingredient with composite key

```bash
curl -X POST http://localhost:5000/api/recipe-ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "recipe_id": 1,
    "inventory_item_id": 2,
    "quantity_required": 0.35,
    "measurement_unit": "kg"
  }'
```

### 6. Read SQL view data

```bash
curl http://localhost:5000/api/views/customer-order-summary
```

## Notes for Viva

- The backend uses a reusable CRUD pattern, but the table names, primary keys, and field names still come directly from your schema.
- The `ORDER` table is safely handled with MySQL identifier quoting because `ORDER` is a reserved SQL keyword.
- `RECIPE_INGREDIENT` uses a composite primary key, so its route includes both `recipe_id` and `inventory_item_id`.
- The database init script uses the MySQL CLI instead of re-writing the SQL files, which preserves your original DDL and DML exactly.
