USE RestaurantDB;

/* ==========================================
   Advanced DBMS Enhancements
   ========================================== */

CREATE INDEX idx_order_customer_id ON `ORDER` (customer_id);
CREATE INDEX idx_order_employee_id ON `ORDER` (employee_id);
CREATE INDEX idx_order_order_date ON `ORDER` (order_date);
CREATE INDEX idx_order_item_order_id ON ORDER_ITEM (order_id);
CREATE INDEX idx_order_item_menu_item_id ON ORDER_ITEM (menu_item_id);
CREATE INDEX idx_bill_order_id ON BILL (order_id);

CREATE TABLE IF NOT EXISTS AUDIT_LOG (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action_type ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    changed_by VARCHAR(60) DEFAULT 'system-db',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS sales_summary_view;
CREATE VIEW sales_summary_view AS
SELECT
    DATE(o.order_date) AS order_day,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(b.final_amount), 0) AS total_revenue
FROM `ORDER` o
LEFT JOIN BILL b ON b.order_id = o.order_id
GROUP BY DATE(o.order_date);

DROP VIEW IF EXISTS order_analytics_view;
CREATE VIEW order_analytics_view AS
SELECT
    o.order_id,
    c.name AS customer_name,
    o.order_status,
    o.total_amount,
    b.final_amount,
    b.payment_status
FROM `ORDER` o
JOIN CUSTOMER c ON c.customer_id = o.customer_id
LEFT JOIN BILL b ON b.order_id = o.order_id;

DROP TRIGGER IF EXISTS reduce_inventory;
DROP TRIGGER IF EXISTS before_inventory_insert_guard;
DROP TRIGGER IF EXISTS before_inventory_update_guard;
DROP TRIGGER IF EXISTS before_order_insert_timestamp;
DROP TRIGGER IF EXISTS after_menu_item_update_audit;
DROP TRIGGER IF EXISTS after_order_status_update_audit;

DELIMITER $$

CREATE TRIGGER before_inventory_insert_guard
BEFORE INSERT ON INVENTORY_ITEM
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock quantity cannot be negative.';
    END IF;
END$$

CREATE TRIGGER before_inventory_update_guard
BEFORE UPDATE ON INVENTORY_ITEM
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock quantity cannot be negative.';
    END IF;
END$$

CREATE TRIGGER before_order_insert_timestamp
BEFORE INSERT ON `ORDER`
FOR EACH ROW
BEGIN
    IF NEW.order_date IS NULL THEN
        SET NEW.order_date = NOW();
    END IF;
END$$

CREATE TRIGGER reduce_inventory
AFTER INSERT ON ORDER_ITEM
FOR EACH ROW
BEGIN
    UPDATE INVENTORY_ITEM ii
    JOIN RECIPE_INGREDIENT ri ON ri.inventory_item_id = ii.inventory_item_id
    JOIN RECIPE r ON r.recipe_id = ri.recipe_id
    SET ii.stock_quantity = ii.stock_quantity - (ri.quantity_required * NEW.quantity)
    WHERE r.menu_item_id = NEW.menu_item_id;
END$$

CREATE TRIGGER after_menu_item_update_audit
AFTER UPDATE ON MENU_ITEM
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG(table_name, record_id, action_type, old_value, new_value, changed_by)
    VALUES(
        'MENU_ITEM',
        OLD.menu_item_id,
        'UPDATE',
        JSON_OBJECT('item_name', OLD.item_name, 'price', OLD.price, 'availability_status', OLD.availability_status),
        JSON_OBJECT('item_name', NEW.item_name, 'price', NEW.price, 'availability_status', NEW.availability_status),
        'db-trigger'
    );
END$$

CREATE TRIGGER after_order_status_update_audit
AFTER UPDATE ON `ORDER`
FOR EACH ROW
BEGIN
    IF OLD.order_status <> NEW.order_status THEN
        INSERT INTO AUDIT_LOG(table_name, record_id, action_type, old_value, new_value, changed_by)
        VALUES(
            'ORDER',
            OLD.order_id,
            'UPDATE',
            JSON_OBJECT('order_status', OLD.order_status),
            JSON_OBJECT('order_status', NEW.order_status),
            'db-trigger'
        );
    END IF;
END$$

CREATE PROCEDURE GetTopSellingItems()
BEGIN
    SELECT
        m.item_name,
        SUM(oi.quantity) AS total_quantity,
        SUM(oi.subtotal) AS total_revenue
    FROM ORDER_ITEM oi
    JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
    GROUP BY m.item_name
    ORDER BY total_quantity DESC, total_revenue DESC
    LIMIT 5;
END$$

CREATE PROCEDURE CalculateBill(IN p_order_id INT, OUT p_final_amount DECIMAL(10,2), OUT p_tax_amount DECIMAL(10,2))
BEGIN
    DECLARE v_total_amount DECIMAL(10,2) DEFAULT 0;

    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_total_amount
    FROM ORDER_ITEM
    WHERE order_id = p_order_id;

    SET p_tax_amount = ROUND(v_total_amount * 0.05, 2);
    SET p_final_amount = ROUND(v_total_amount + p_tax_amount, 2);
END$$

DELIMITER ;

EXPLAIN SELECT * FROM `ORDER` WHERE customer_id = 1;
EXPLAIN SELECT * FROM ORDER_ITEM WHERE order_id = 1;
