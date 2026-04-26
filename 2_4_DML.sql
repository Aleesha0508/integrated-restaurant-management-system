
USE RestaurantDB;
SELECT DATABASE();
USE RestaurantDB;
SELECT COUNT(*) FROM MENU_ITEM;
SELECT COUNT(*) FROM CUSTOMER;
SELECT COUNT(*) FROM `ORDER`;

USE RestaurantDB;
SELECT 'MENU_ITEM' AS tbl, COUNT(*) AS cnt FROM MENU_ITEM
UNION ALL
SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER
UNION ALL
SELECT 'ORDER', COUNT(*) FROM `ORDER`
UNION ALL
SELECT 'BILL', COUNT(*) FROM BILL
UNION ALL
SELECT 'EMPLOYEE', COUNT(*) FROM EMPLOYEE;

-- ==========================================
-- 1) CUSTOMER
-- ==========================================
INSERT INTO CUSTOMER (name, phone, email, street, city, state, pincode) VALUES
('Aarav Mehta', '9876543210', 'aarav@gmail.com', '12 MG Road', 'Chennai', 'Tamil Nadu', '600001'),
('Sneha Sharma', '9123456780', 'sneha@gmail.com', '45 Anna Nagar', 'Chennai', 'Tamil Nadu', '600040'),
('Rahul Verma', '9988776655', 'rahul@gmail.com', '88 T Nagar', 'Chennai', 'Tamil Nadu', '600017');


-- ==========================================
-- 2) EMPLOYEE
-- ==========================================
INSERT INTO EMPLOYEE (name, role, phone, email, salary, join_date) VALUES
('Karthik Raj', 'Chef', '9000011111', 'karthik.chef@gmail.com', 35000.00, '2023-06-15'),
('Meera Nair', 'Chef', '9000022222', 'meera.chef@gmail.com', 38000.00, '2023-08-10'),
('Ananya Iyer', 'Manager', '9000033333', 'ananya.manager@gmail.com', 50000.00, '2022-12-01');


-- ==========================================
-- 3) MENU_ITEM
-- ==========================================
INSERT INTO MENU_ITEM (item_name, price, category, availability_status) VALUES
('Paneer Butter Masala', 220.00, 'Main Course', 'Available'),
('Veg Biryani', 180.00, 'Main Course', 'Available'),
('Masala Dosa', 120.00, 'Breakfast', 'Available'),
('Cold Coffee', 90.00, 'Beverage', 'Available');


-- ==========================================
-- 4) INVENTORY_ITEM
-- ==========================================
INSERT INTO INVENTORY_ITEM (item_name, unit, stock_quantity, reorder_level, expiry_date) VALUES
('Paneer', 'kg', 12.0, 5.0, '2026-03-10'),
('Rice', 'kg', 50.0, 20.0, '2026-09-01'),
('Milk', 'litre', 25.0, 10.0, '2026-02-20'),
('Coffee Powder', 'kg', 5.0, 2.0, '2026-08-15'),
('Butter', 'kg', 8.0, 3.0, '2026-04-05');


-- ==========================================
-- 5) SUPPLIER
-- ==========================================
INSERT INTO SUPPLIER (supplier_name, company_name, phone, rating) VALUES
('Fresh Dairy Supplier', 'FreshDairy Pvt Ltd', '9111122233', 4.5),
('Daily Groceries', 'DailyGroceries Wholesale', '9222233344', 4.2),
('Spice Hub', 'SpiceHub Traders', '9333344455', 4.7);


-- ==========================================
-- 6) ORDER
-- FK: customer_id → CUSTOMER
-- FK: employee_id → EMPLOYEE
-- ==========================================
INSERT INTO `ORDER` (order_date, order_status, total_amount, customer_id, employee_id) VALUES
('2026-02-01 10:30:00', 'Placed', 400.00, 1, 1),
('2026-02-01 12:15:00', 'Preparing', 300.00, 2, 2),
('2026-02-02 19:45:00', 'Completed', 220.00, 3, 1);


-- ==========================================
-- 7) ORDER_ITEM
-- FK: order_id → ORDER
-- FK: menu_item_id → MENU_ITEM
-- ==========================================
INSERT INTO ORDER_ITEM (quantity, item_price, subtotal, order_id, menu_item_id) VALUES
(1, 220.00, 220.00, 1, 1),
(1, 180.00, 180.00, 1, 2),
(2, 120.00, 240.00, 2, 3),
(1, 90.00, 90.00, 2, 4),
(1, 220.00, 220.00, 3, 1);


-- ==========================================
-- 8) BILL
-- FK: order_id → ORDER (Unique)
-- ==========================================
INSERT INTO BILL (final_amount, tax_amount, payment_mode, payment_status, order_id) VALUES
(420.00, 20.00, 'UPI', 'Paid', 1),
(315.00, 15.00, 'Card', 'Paid', 2),
(231.00, 11.00, 'Cash', 'Paid', 3);


-- ==========================================
-- 9) RECIPE
-- FK: menu_item_id → MENU_ITEM (Unique)
-- ==========================================
INSERT INTO RECIPE (instructions, menu_item_id) VALUES
('Cook paneer in butter gravy with spices.', 1),
('Cook rice with vegetables and spices.', 2),
('Prepare dosa batter and cook on tawa.', 3),
('Mix chilled milk with coffee and sugar.', 4);


-- ==========================================
-- 10) RECIPE_INGREDIENT
-- FK: recipe_id → RECIPE
-- FK: inventory_item_id → INVENTORY_ITEM
-- ==========================================
INSERT INTO RECIPE_INGREDIENT (recipe_id, inventory_item_id, quantity_required, measurement_unit) VALUES
(1, 1, 0.25, 'kg'),
(1, 5, 0.10, 'kg'),
(2, 2, 0.30, 'kg'),
(3, 2, 0.10, 'kg'),
(4, 3, 0.20, 'litre'),
(4, 4, 0.02, 'kg');


-- ==========================================
-- 11) PURCHASE_ORDER
-- FK: supplier_id → SUPPLIER
-- FK: employee_id → EMPLOYEE
-- ==========================================
INSERT INTO PURCHASE_ORDER (purchase_date, status, supplier_id, employee_id) VALUES
('2026-02-01 09:00:00', 'Ordered', 1, 3),
('2026-02-02 09:30:00', 'Received', 2, 3);


-- ==========================================
-- 12) PURCHASE_ORDER_ITEM
-- FK: purchase_order_id → PURCHASE_ORDER
-- FK: inventory_item_id → INVENTORY_ITEM
-- ==========================================
INSERT INTO PURCHASE_ORDER_ITEM (quantity, unit_price, purchase_order_id, inventory_item_id) VALUES
(10.0, 280.00, 1, 1),
(5.0, 420.00, 1, 5),
(20.0, 55.00, 2, 2),
(10.0, 60.00, 2, 3);

INSERT INTO `ORDER` (order_date, order_status, total_amount, customer_id, employee_id)
VALUES ('2026-01-20', 'Completed', 250.00, 1, 1);

INSERT INTO MENU_ITEM (item_name, price, category, availability_status)
VALUES ('Chocolate Cake', 150.00, 'Dessert', 'Available');

INSERT INTO MENU_ITEM (item_name, price, category, availability_status) VALUES
('Idli Sambar', 80.00, 'Breakfast', 'Available'),
('Chicken Biryani', 250.00, 'Main Course', 'Available'),
('Veg Fried Rice', 160.00, 'Main Course', 'Available'),
('Tomato Soup', 110.00, 'Starter', 'Available'),
('Ice Cream Sundae', 140.00, 'Dessert', 'Available'),
('Fresh Lime Soda', 70.00, 'Beverage', 'Available');

INSERT INTO RECIPE (instructions, menu_item_id) VALUES
('Steam idli batter and serve with sambar.',5),
('Cook chicken with spices and basmati rice.',6),
('Stir fry vegetables with cooked rice.',7),
('Boil tomatoes with spices and blend.',8),
('Serve ice cream with chocolate syrup.',9),
('Mix lime juice with soda and sugar.',10);

INSERT INTO RECIPE_INGREDIENT (recipe_id, inventory_item_id, quantity_required, measurement_unit) VALUES
(5,2,0.15,'kg'),
(6,2,0.30,'kg'),
(7,2,0.25,'kg'),
(8,2,0.10,'kg'),
(9,3,0.10,'litre'),
(10,3,0.05,'litre');

INSERT INTO ORDER_ITEM (quantity,item_price,subtotal,order_id,menu_item_id) VALUES
(1,80,80,1,5),
(1,250,250,2,6),
(2,160,320,3,7),
(1,110,110,1,8),
(1,140,140,2,9);

UPDATE INVENTORY_ITEM
SET stock_quantity = 2
WHERE inventory_item_id = 1;

SELECT * FROM CUSTOMER;
SELECT * FROM EMPLOYEE;
SELECT * FROM MENU_ITEM;
SELECT * FROM INVENTORY_ITEM;
SELECT * FROM SUPPLIER;

SELECT * FROM `ORDER`;
SELECT * FROM ORDER_ITEM;
SELECT * FROM BILL;

SELECT * FROM RECIPE;
SELECT * FROM RECIPE_INGREDIENT;

SELECT * FROM PURCHASE_ORDER;
SELECT * FROM PURCHASE_ORDER_ITEM;

ALTER TABLE MENU_ITEM
ADD CONSTRAINT chk_price_positive
CHECK (price > 0);

INSERT INTO MENU_ITEM(item_name,price,category)
VALUES ('Invalid Dish', -50, 'Main Course');

ALTER TABLE SUPPLIER
ADD CONSTRAINT chk_supplier_rating
CHECK (rating BETWEEN 1 AND 5);

INSERT INTO SUPPLIER(supplier_name,company_name,phone,rating)
VALUES('Test Supplier','Test Co','9999999999',7);

ALTER TABLE INVENTORY_ITEM
ADD CONSTRAINT chk_stock_quantity
CHECK (stock_quantity >= 0);

UPDATE INVENTORY_ITEM
SET stock_quantity = -5
WHERE inventory_item_id = 1;

SELECT SUM(final_amount) AS Total_Revenue
FROM BILL;

SELECT m.item_name,
SUM(oi.quantity) AS total_quantity
FROM MENU_ITEM m
JOIN ORDER_ITEM oi
ON m.menu_item_id = oi.menu_item_id
GROUP BY m.item_name
ORDER BY total_quantity DESC
LIMIT 1;

SELECT AVG(final_amount) AS Avg_Bill
FROM BILL;

SELECT customer_id
FROM `ORDER`
WHERE MONTH(order_date)=1
AND customer_id IN
(
SELECT customer_id
FROM `ORDER`
WHERE MONTH(order_date)=2
);

SELECT name AS contact_name, phone
FROM CUSTOMER
UNION
SELECT supplier_name, phone
FROM SUPPLIER;

SELECT menu_item_id
FROM MENU_ITEM
WHERE menu_item_id NOT IN
(
SELECT menu_item_id
FROM ORDER_ITEM
);

SELECT item_name
FROM MENU_ITEM
WHERE menu_item_id NOT IN
(
SELECT menu_item_id
FROM ORDER_ITEM
);

SELECT item_name, price
FROM MENU_ITEM
WHERE price >
(
SELECT AVG(price)
FROM MENU_ITEM
);

SELECT name
FROM CUSTOMER
WHERE customer_id IN
(
SELECT customer_id
FROM `ORDER`
WHERE order_id IN
(
SELECT order_id
FROM BILL
WHERE final_amount >
(
SELECT AVG(final_amount)
FROM BILL
)
)
);

SELECT item_name
FROM MENU_ITEM
WHERE menu_item_id IN
(
SELECT r.menu_item_id
FROM RECIPE r
WHERE r.recipe_id IN
(
SELECT recipe_id
FROM RECIPE_INGREDIENT
WHERE inventory_item_id IN
(
SELECT inventory_item_id
FROM INVENTORY_ITEM
WHERE stock_quantity < reorder_level
)
)
);

SELECT c.name,
o.order_id,
b.final_amount
FROM CUSTOMER c
JOIN `ORDER` o
ON c.customer_id=o.customer_id
JOIN BILL b
ON o.order_id=b.order_id;

SELECT o.order_id,
m.item_name,
oi.quantity
FROM ORDER_ITEM oi
JOIN MENU_ITEM m
ON oi.menu_item_id=m.menu_item_id
JOIN `ORDER` o
ON oi.order_id=o.order_id;

SELECT m.item_name,
SUM(oi.subtotal) AS total_revenue
FROM MENU_ITEM m
JOIN ORDER_ITEM oi
ON m.menu_item_id=oi.menu_item_id
GROUP BY m.item_name;


SELECT 'MENU_ITEM' AS tbl, COUNT(*) AS cnt FROM MENU_ITEM
UNION ALL
SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER
UNION ALL
SELECT 'ORDER', COUNT(*) FROM `ORDER`
UNION ALL
SELECT 'BILL', COUNT(*) FROM BILL
UNION ALL
SELECT 'EMPLOYEE', COUNT(*) FROM EMPLOYEE;
