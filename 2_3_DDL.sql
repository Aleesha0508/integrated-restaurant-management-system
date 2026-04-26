/* ================================
   2.3 DDL COMMANDS (MySQL)
   Integrated Restaurant Management System
   ================================ */

DROP DATABASE IF EXISTS RestaurantDB;
CREATE DATABASE RestaurantDB;
USE RestaurantDB;

/* 1) CUSTOMER */
CREATE TABLE CUSTOMER (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(80) UNIQUE,
    street VARCHAR(80) NOT NULL,
    city VARCHAR(30) NOT NULL,
    state VARCHAR(30) NOT NULL,
    pincode VARCHAR(10) NOT NULL
);

/* 2) EMPLOYEE */
CREATE TABLE EMPLOYEE (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    role ENUM('Chef','Manager') NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(80) UNIQUE,
    salary DECIMAL(10,2) NOT NULL,
    join_date DATE NOT NULL
);

/* 3) MENU_ITEM */
CREATE TABLE MENU_ITEM (
    menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(60) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(30) NOT NULL,
    availability_status ENUM('Available','Not Available') DEFAULT 'Available'
);

/* 4) INVENTORY_ITEM */
CREATE TABLE INVENTORY_ITEM (
    inventory_item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(60) NOT NULL,
    unit VARCHAR(15) NOT NULL,
    stock_quantity DECIMAL(10,2) NOT NULL,
    reorder_level DECIMAL(10,2) NOT NULL,
    expiry_date DATE
);

/* 5) SUPPLIER */
CREATE TABLE SUPPLIER (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(60) NOT NULL,
    company_name VARCHAR(80),
    phone VARCHAR(15) NOT NULL,
    rating DECIMAL(2,1)
);

/* 6) ORDER */
CREATE TABLE `ORDER` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATETIME NOT NULL,
    order_status ENUM('Placed','Preparing','Ready','Completed','Cancelled') NOT NULL,
    total_amount DECIMAL(10,2),

    customer_id INT NOT NULL,
    employee_id INT,

    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id)
);

/* 7) ORDER_ITEM */
CREATE TABLE ORDER_ITEM (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    quantity INT NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2),

    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,

    FOREIGN KEY (order_id) REFERENCES `ORDER`(order_id),
    FOREIGN KEY (menu_item_id) REFERENCES MENU_ITEM(menu_item_id)
);

/* 8) BILL */
CREATE TABLE BILL (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    final_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('Cash','Card','UPI') NOT NULL,
    payment_status ENUM('Pending','Paid','Failed') NOT NULL,

    order_id INT NOT NULL UNIQUE,
    FOREIGN KEY (order_id) REFERENCES `ORDER`(order_id)
);

/* 9) RECIPE */
CREATE TABLE RECIPE (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    instructions TEXT NOT NULL,

    menu_item_id INT NOT NULL UNIQUE,
    FOREIGN KEY (menu_item_id) REFERENCES MENU_ITEM(menu_item_id)
);

/* 10) RECIPE_INGREDIENT */
CREATE TABLE RECIPE_INGREDIENT (
    recipe_id INT NOT NULL,
    inventory_item_id INT NOT NULL,
    quantity_required DECIMAL(10,2) NOT NULL,
    measurement_unit VARCHAR(15) NOT NULL,

    PRIMARY KEY (recipe_id, inventory_item_id),

    FOREIGN KEY (recipe_id) REFERENCES RECIPE(recipe_id),
    FOREIGN KEY (inventory_item_id) REFERENCES INVENTORY_ITEM(inventory_item_id)
);

/* 11) PURCHASE_ORDER */
CREATE TABLE PURCHASE_ORDER (
    purchase_order_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_date DATETIME NOT NULL,
    status ENUM('Requested','Ordered','Received','Cancelled') NOT NULL,

    supplier_id INT NOT NULL,
    employee_id INT NOT NULL,

    FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id)
);

/* 12) PURCHASE_ORDER_ITEM */
CREATE TABLE PURCHASE_ORDER_ITEM (
    purchase_order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,

    purchase_order_id INT NOT NULL,
    inventory_item_id INT NOT NULL,

    FOREIGN KEY (purchase_order_id) REFERENCES PURCHASE_ORDER(purchase_order_id),
    FOREIGN KEY (inventory_item_id) REFERENCES INVENTORY_ITEM(inventory_item_id)
);

SHOW TABLES;

DROP VIEW IF EXISTS customer_order_summary;
DROP VIEW IF EXISTS low_stock_inventory;

CREATE VIEW customer_order_summary AS
SELECT c.name,
o.order_id,
b.final_amount
FROM CUSTOMER c
JOIN `ORDER` o
ON c.customer_id=o.customer_id
JOIN BILL b
ON o.order_id=b.order_id;

SELECT * FROM customer_order_summary;

UPDATE INVENTORY_ITEM
SET stock_quantity = 2
WHERE inventory_item_id = 1;

CREATE OR REPLACE VIEW low_stock_inventory AS
SELECT item_name, stock_quantity, reorder_level
FROM INVENTORY_ITEM
WHERE stock_quantity < reorder_level;

SELECT * FROM low_stock_inventory;

SELECT name,
order_id,
final_amount
FROM customer_order_summary
WHERE final_amount > 300
ORDER BY final_amount DESC;

DELIMITER $$
CREATE TRIGGER check_salary
BEFORE INSERT ON EMPLOYEE
FOR EACH ROW
BEGIN
IF NEW.salary < 10000 THEN
SET NEW.salary = 10000;
END IF;
END$$
DELIMITER ;

INSERT INTO EMPLOYEE(name,role,phone,email,salary,join_date)
VALUES('Ravi Kumar','Chef','9876541234','ravi@test.com',5000,'2024-01-01');

SELECT name,salary
FROM EMPLOYEE
WHERE name='Ravi Kumar';

CREATE TABLE salary_log
(
emp_id INT,
old_salary DECIMAL(10,2),
new_salary DECIMAL(10,2),
changed_on TIMESTAMP
);

DELIMITER $$

CREATE TRIGGER after_salary_update
AFTER UPDATE ON EMPLOYEE
FOR EACH ROW
BEGIN
INSERT INTO salary_log
VALUES(OLD.employee_id,OLD.salary,NEW.salary,NOW());
END$$

DELIMITER ;

UPDATE EMPLOYEE
SET salary = 45000
WHERE employee_id = 1;

SELECT * FROM salary_log;

DELIMITER $$

CREATE TRIGGER reduce_inventory
AFTER INSERT ON ORDER_ITEM
FOR EACH ROW
BEGIN
UPDATE INVENTORY_ITEM
SET stock_quantity = stock_quantity - NEW.quantity
WHERE inventory_item_id = NEW.menu_item_id;
END$$

DELIMITER ;

INSERT INTO ORDER_ITEM(quantity,item_price,subtotal,order_id,menu_item_id)
VALUES(1,220,220,1,1);

SELECT inventory_item_id,item_name,stock_quantity
FROM INVENTORY_ITEM
WHERE inventory_item_id=1;

DELIMITER $$

CREATE PROCEDURE show_employee_names()
BEGIN

DECLARE done INT DEFAULT 0;
DECLARE v_name VARCHAR(50);

DECLARE emp_cursor CURSOR FOR
SELECT name FROM EMPLOYEE;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

OPEN emp_cursor;

read_loop: LOOP
FETCH emp_cursor INTO v_name;

IF done = 1 THEN
LEAVE read_loop;
END IF;

SELECT v_name AS Employee_Name;

END LOOP;

CLOSE emp_cursor;

END$$

DELIMITER ;

CALL show_employee_names();

DELIMITER $$

CREATE PROCEDURE show_menu_items()
BEGIN

DECLARE done INT DEFAULT 0;
DECLARE v_item VARCHAR(60);
DECLARE v_price DECIMAL(10,2);

DECLARE menu_cursor CURSOR FOR
SELECT item_name, price FROM MENU_ITEM;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

OPEN menu_cursor;

read_loop: LOOP

FETCH menu_cursor INTO v_item, v_price;

IF done = 1 THEN
LEAVE read_loop;
END IF;

SELECT v_item AS Item_Name, v_price AS Price;

END LOOP;

CLOSE menu_cursor;

END$$

DELIMITER ;

CALL show_menu_items();

DELIMITER $$

CREATE PROCEDURE show_order_bills()
BEGIN

DECLARE done INT DEFAULT 0;
DECLARE v_order INT;
DECLARE v_amount DECIMAL(10,2);

DECLARE bill_cursor CURSOR FOR
SELECT order_id, final_amount FROM BILL;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

OPEN bill_cursor;

read_loop: LOOP

FETCH bill_cursor INTO v_order, v_amount;

IF done = 1 THEN
LEAVE read_loop;
END IF;

SELECT v_order AS Order_ID, v_amount AS Bill_Amount;

END LOOP;

CLOSE bill_cursor;

END$$

DELIMITER ;

CALL show_order_bills();