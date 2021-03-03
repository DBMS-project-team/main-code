create table departments (
    dept_id int not null auto_increment,
    name varchar(50),
    constraint
    primary key (dept_id)
);

create table job_titles (
    job_id int not null auto_increment,
    job_title_name varchar(50),
    primary key (job_id)
);

create table pay_grades (
    pay_grade_level int not null auto_increment,
    pay_grade_level_title varchar(50),
    salary DECIMAL(13, 2) UNSIGNED NOT NULL,
    primary key (pay_grade_level)
);

create table employment_statuses(
    emp_status_id int not null auto_increment,
    emp_status varchar(50),
    primary key (emp_status_id)
);

CREATE TABLE branches (
    branch_id int(11) NOT NULL AUTO_INCREMENT,
    title varchar(64) NOT NULL,
    code varchar(3) DEFAULT NULL,
    lat DECIMAL(11,8) DEFAULT 0,
    lng DECIMAL(11,8) DEFAULT 0,
    status TINYINT DEFAULT 1,
    PRIMARY KEY (branch_id),
    CHECK (status=0 OR status=1)
);

create table employees (
    emp_id int not null auto_increment,
    staff_id VARCHAR(10) NULL DEFAULT NULL
    firstname varchar(50) not null,
    lastname varchar (50) not null,
    status TINYINT DEFAULT 1,
    birthdate date,
    gender ENUM ( 'male', 'female', 'transgender', 'gender_neutral', 'non_binary', 'agender', 'pangender', 'genderqueer', 'two_spirit', 'third_gender', 'all') DEFAULT 'male',
    marital_status ENUM ('single', 'married', 'widowed', 'divorced', 'separated','registered_partnership') DEFAULT 'single',
    address VARCHAR(100) NULL,
    primary_phone_num INT(12) NULL,
    dept_id int(11),
    branch_id int(11),
    job_id int(11),
    emp_status_id int(11),
    emp_status_type ENUM ('not_applicable', 'full_time', 'part_time') DEFAULT 'not_applicable',
    pay_grade_level int(11),
    primary key(emp_id),
	foreign key (dept_id) references departments(dept_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
	foreign key (job_id) references job_titles(job_id),
    FOREIGN KEY (emp_status_id) REFERENCES employment_statuses(emp_status_id),
	foreign key (pay_grade_level) references pay_grades(pay_grade_level),
    ADD UNIQUE `unique` (`staff_id`)
);

CREATE UNIQUE INDEX employee_index ON employees ( status, dept_id);

CREATE TABLE supervisors (
    emp_id int(11) not null,
    supervisor int(11),
    PRIMARY KEY (emp_id),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (supervisor) REFERENCES employees(emp_id)
);

CREATE TABLE organization_details (
    org_id int not null AUTO_INCREMENT,
    org_name varchar(50),
    registration_number int(11),
    address varchar(50),
    admin_password varchar(50),
    PRIMARY KEY (org_id)
);

CREATE TABLE user_levels (
    user_level int NOT null AUTO_INCREMENT,
    user_level_title varchar(50),
    PRIMARY KEY (user_level)
);

create table users(
    emp_id int(11) NOT null,
    username varchar(64) NOT NULL UNIQUE,
    user_level int(11),
    status TINYINT DEFAULT 1,
    password varchar(50),
    PRIMARY KEY (emp_id),
    FOREIGN key (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (user_level) REFERENCES user_levels(user_level)
);

CREATE TABLE menus (
    menu_id int(11) not null auto_increment,
    title varchar(50) not null,
    href varchar(50),
    icon varchar(20),
    parent int(11),
    PRIMARY key (menu_id),
    FOREIGN KEY (parent) REFERENCES menus(menu_id)
);

CREATE TABLE menu_permissions (
    user_level int(11),
    menu_id int(11),
    permission int(1),
    PRIMARY KEY (user_level, menu_id),
    UNIQUE(user_level, menu_id),
    FOREIGN KEY (user_level) REFERENCES user_levels(user_level),
    FOREIGN KEY (menu_id) REFERENCES menus(menu_id)
);

CREATE table custom_fields (
    custom_field_id int AUTO_INCREMENT,
    custom_field_name varchar (50),
    PRIMARY KEY (custom_field_id)
);

CREATE TABLE custom_field_values (
    custom_field_value_id int AUTO_INCREMENT,
    custom_field_id int(11),
    custom_field_value varchar(50),
    FOREIGN KEY (custom_field_id) REFERENCES custom_fields(custom_field_id),
    PRIMARY KEY (custom_field_value_id)
);

CREATE TABLE employee_additional_details (
    emp_id int(11),
    custom_field_value_id int(11),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (custom_field_value_id) REFERENCES custom_field_values(custom_field_value_id),
    PRIMARY KEY (emp_id, custom_field_value_id)
);

CREATE TABLE emergency_contact_items (
    eme_item_id int AUTO_INCREMENT,
    eme_item_name varchar(64),
    personal TINYINT DEFAULT 0,
    is_required TINYINT DEFAULT 0,
    multivalued TINYINT DEFAULT 0,
    PRIMARY KEY (eme_item_id)
);

CREATE TABLE emergency_contact_details (
    emp_id int(11),
    eme_item_id int(11),
    eme_item_value varchar(50),
    PRIMARY KEY (emp_id, eme_item_id, eme_item_value),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (eme_item_id) REFERENCES emergency_contact_items(eme_item_id)
);

CREATE TABLE leave_types (
    leave_type_id int AUTO_INCREMENT,
    leave_type varchar(50),
    PRIMARY KEY (leave_type_id)
);

CREATE TABLE max_leave_days (
    leave_type_id int(11),
    pay_grade_level int(11),
    no_of_leaves int(3),
    PRIMARY KEY (leave_id, pay_grade_level),
    FOREIGN KEY (leave_id) REFERENCES leave_types(leave_id),
    FOREIGN KEY (pay_grade_level) REFERENCES pay_grades(pay_grade_level)
);

CREATE TABLE leave_application_statuses (
    status_id int AUTO_INCREMENT,
    title varchar(50),
    PRIMARY KEY (status_id)
);

CREATE TABLE leave_applications (
    leave_id INT AUTO_INCREMENT,
    emp_id int(11) not null,
    apply_date_time datetime not null,
    leave_type_id int(11) not null,
    leave_from date,
    leave_to date,
    period int(3),
    status_id int(11),
    PRIMARY KEY (leave_id),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
    FOREIGN KEY (status_id) REFERENCES leave_application_statuses(status_id)
);

--/////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS employeesProcedure;
DELIMITER $$
CREATE PROCEDURE employeesProcedure ()
BEGIN
	SET @sql = NULL;
    SET @custom_fields = 0;
    SELECT COUNT(1) INTO @custom_fields FROM employee_additional_details;
    IF @custom_fields <> 0 THEN
        SELECT
        GROUP_CONCAT(DISTINCT
            CONCAT(
                'GROUP_CONCAT((CASE custom_field_id when ',
                custom_field_id,
                ' then custom_field_value else NULL END)) AS ',
                'custom_field_', custom_field_id,
                ', ',
                'GROUP_CONCAT((CASE custom_field_id when ',
                custom_field_id,
                ' then custom_field_value_id else NULL END)) AS ',
                'custom_field_',custom_field_id, '_id'
            )
        ) INTO @sql
        FROM employee_additional_details natural join custom_field_values natural join custom_fields;
        SET @sql = concat(', ',@sql);
    ELSE
        SET @sql = '';
    END IF;

    

    SET @sql = CONCAT('CREATE OR REPLACE VIEW employees_details AS SELECT
                        e.firstname, e.lastname, e.birthdate, e.marital_status, e.address, e.primary_phone_num, e.dept_id, e.job_id, e.emp_status_id, e.pay_grade_level pay_grade_level_id,
                        additional.*,
                        d.name department, p.pay_grade_level_title pay_grade_level, j.job_title_name job_title,
                        u.username
                        FROM employees e NATURAL LEFT OUTER JOIN (
                        SELECT emp_id', @sql, ' 
                        FROM employee_additional_details natural join custom_field_values
                        GROUP BY emp_id
                        ) additional
                        NATURAL JOIN departments d
                        NATURAL JOIN pay_grades p
                        NATURAL JOIN job_titles j
                        NATURAL LEFT OUTER JOIN users u
                        WHERE e.status = 1
                        ');

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$
DELIMITER ;
call employeesProcedure ();

-- ///////////////////////////////////////////////////
-- menupermission procedure

DROP PROCEDURE IF EXISTS menuPermission;
DELIMITER $$
CREATE PROCEDURE menuPermission ()
BEGIN
	SET @sql = NULL;
    SET @rows = 0;
    SELECT COUNT(1) INTO @rows FROM user_levels;
    IF @rows <> 0 THEN
        SELECT
        GROUP_CONCAT(DISTINCT
            CONCAT(
                'GROUP_CONCAT((CASE user_level when ',
                user_level,
                ' then permission else NULL END)) AS ',
                'user_level_', user_level
            )
        ) INTO @sql
        FROM menu_permissions natural join user_levels;
        SET @sql = concat(', ',@sql);
    ELSE
        SET @sql = '';
    END IF;

    SET @sql = CONCAT('CREATE OR REPLACE VIEW pivoted_menu_permissions AS SELECT
                        *
                        FROM menus m NATURAL LEFT OUTER JOIN (
                        SELECT menu_id', @sql, ' 
                        FROM menu_permissions
                        GROUP BY menu_id
                        ) menus
                        ');

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$
DELIMITER ;
call menuPermission ();

-- ///////////////////////////////////////////////////
-- max leave

DROP PROCEDURE IF EXISTS maxLeaves;
DELIMITER $$
CREATE PROCEDURE maxLeaves ()
BEGIN
	SET @sql = NULL;
    SET @rows = 0;
    SELECT COUNT(1) INTO @rows FROM max_leave_days;
    IF @rows <> 0 THEN
        SELECT
        GROUP_CONCAT(DISTINCT
            CONCAT(
                'GROUP_CONCAT((CASE pay_grade_level when ',
                pay_grade_level,
                ' then max_no_of_leaves else NULL END)) AS ',
                'pay_grade_level_', pay_grade_level
            )
        ) INTO @sql
        FROM max_leave_days;
        SET @sql = concat(', ',@sql);
    ELSE
        SET @sql = '';
    END IF;

    SET @sql = CONCAT('CREATE OR REPLACE VIEW pivoted_max_leave_days AS SELECT
                        *
                        FROM leave_types NATURAL LEFT OUTER JOIN (
                        SELECT leave_type_id', @sql, ' 
                        FROM max_leave_days
                        GROUP BY leave_type_id
                        ) leaves
                        ');

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$
DELIMITER ;
call maxLeaves ();

-- //////////////////////////////////////////
-- Procedure for update menu permission

DROP PROCEDURE IF EXISTS updateMenuPermission;
DELIMITER $$
CREATE PROCEDURE updateMenuPermission(
    menu_id INT(11), user_level INT(11), permission INT(1)
)
BEGIN
    INSERT INTO `menu_permissions` VALUES (user_level, menu_id, permission) ON DUPLICATE KEY UPDATE `permission`=permission;
    call menuPermission ();
END$$
DELIMITER ;

-- ///////////////////////////////////////////////////
-- custom attributes

DROP PROCEDURE IF EXISTS `custom_attributes`;
CREATE PROCEDURE `custom_attributes`() NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER
BEGIN 
SELECT
    JSON_OBJECT(
        "field_id",
        custom_fields.custom_field_id,
        "field_name",
        custom_fields.custom_field_name,
        "field_value",
        CONCAT(
            "[",
            GROUP_CONCAT(
                JSON_OBJECT(
                    "id",
                    custom_field_values.custom_field_value_id,
                    "value",
                    custom_field_values.custom_field_value
                )
            ),
            "]"
        )
    ) AS attributes
FROM
    custom_field_values
INNER JOIN
    custom_fields
ON
    custom_field_values.custom_field_id = custom_fields.custom_field_id
GROUP BY
    custom_field_values.custom_field_id;
END

-- ///////////////////////////////////////////////////
-- employee custom attributes

DROP PROCEDURE IF EXISTS `employee_custom_attributes`;
CREATE PROCEDURE `employee_custom_attributes`(IN `empId` INT(10)) NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER BEGIN
	SELECT 
    JSON_OBJECT(
        "field_id",custom_fields.custom_field_id,
        "field_name",custom_fields.custom_field_name,
        "old_value",MAX(employee_additional_details.custom_field_value_id),
        "field_value",
        CONCAT( "[",
               GROUP_CONCAT(
                   JSON_OBJECT(
                       "id",custom_field_values.custom_field_value_id,
                       "value",custom_field_values.custom_field_value,
         "old_value",employee_additional_details.custom_field_value_id
                       )
                   ),
               "]"
          ) )as attributes
     FROM custom_field_values INNER JOIN custom_fields
     on custom_field_values.custom_field_id=custom_fields.custom_field_id
     LEFT OUTER JOIN employee_additional_details on (employee_additional_details.custom_field_value_id=custom_field_values.custom_field_value_id AND
     employee_additional_details.emp_id=empId)
     GROUP BY custom_field_values.custom_field_id;
     
END

-- ///////////////////////////////////////////////////
-- emergency details

DROP PROCEDURE IF EXISTS `emergency_details`;
CREATE PROCEDURE `emergency_details`(IN `empId` INT(10)) NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER
BEGIN
SELECT
    CONCAT(
        "[",
        GROUP_CONCAT(
            JSON_OBJECT(
                "id",
                i.eme_item_id,
                "name",
                i.eme_item_name,
                "old_id",
                d.eme_item_id,
                "old_value",
                d.eme_item_values
            )
        ),
        "]"
    ) AS details
FROM
    emergency_contact_items AS i
LEFT JOIN
    (
    SELECT
        eme_item_id,
        GROUP_CONCAT(JSON_ARRAY(eme_item_value)) AS eme_item_values
    FROM
        emergency_contact_details
    WHERE
        emp_id = empId
    GROUP BY
        eme_item_id
) AS d
ON
    d.eme_item_id = i.eme_item_id
GROUP BY
    i.is_required,
    i.multivalued;
END


-- ///////////////////////////////////////
-- procedure for dashboard
DROP PROCEDURE IF EXISTS `dashboard`;
DELIMITER $$
CREATE PROCEDURE `dashboard` ()
BEGIN
    SELECT departments.*, COUNT(emp_id) `count` FROM departments NATURAL LEFT JOIN employees GROUP BY dept_id;
    SELECT job_titles.*, count(emp_id) count FROM job_titles NATURAL LEFT JOIN employees GROUP BY job_id;
    SELECT pay_grades.*, count(emp_id) count FROM pay_grades NATURAL LEFT JOIN employees GROUP BY pay_grade_level;
    SELECT user_levels.*, count(emp_id) count FROM user_levels NATURAL LEFT JOIN users GROUP BY user_level;
END $$
DELIMITER ;

CALL dashboard();

-- ///////////////////////////////////
-- procedure for leave application

DROP PROCEDURE IF EXISTS leaveApplication;
DELIMITER $$
CREATE PROCEDURE leaveApplication (IN empId INT(11))
BEGIN
    SET @pay_grade_level = NULL;

    SELECT pay_grade_level INTO @pay_grade_level FROM employees WHERE emp_id=empId;
    select a.leave_id,t.leave_type,a.apply_date_time,a.leave_from,a.leave_to,a.period,s.title from leave_applications as a inner join leave_application_statuses as s ON a.status_id=s.status_id inner join leave_types as t ON a.leave_type_id=t.leave_type_id where emp_id=empId;
    SELECT outer_l.*, m.max_no_of_leaves maximum FROM 
        (SELECT leave_types.*, COALESCE(SUM(l.period), 0) total FROM leave_types NATURAL LEFT JOIN 
            (SELECT * FROM leave_applications WHERE emp_id=empId AND status_id=2) l
            GROUP BY leave_type_id) outer_l
        NATURAL JOIN
        (SELECT * from max_leave_days where pay_grade_level=@pay_grade_level) m;
END $$
DELIMITER ;

CALL leaveApplication (5);

-- ////////////////////////////////////////
-- Procedure for change password

-- DROP PROCEDURE IF EXISTS changePassword;
-- DELIMITER $$
-- CREATE PROCEDURE changePassword ( IN empId INT(11), IN curr_pass VARCHAR(50), IN new_pass VARCHAR(50) )
-- BEGIN
    
--     DECLARE old_pass VARCHAR(50);
--     DECLARE _status INT(1);
--     DECLARE result VARCHAR(50);

--     SELECT password INTO old_pass FROM users WHERE emp_id=empId;

--     IF old_pass <> curr_pass THEN
--         SET _status = 0;
--         SET result = 'Provided previous password is incorrect';
--     ELSE
--         UPDATE users SET password=new_pass where emp_id=empId;
--         SET _status = 1;
--         SET result = '';
--     END IF;

--     SELECT _status `status`, result;

-- END $$
-- DELIMITER ;

-- CALL changePassword (17, 123456, 123);

-- ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- Triggers

--///////////////////////////////////////////////////////////////////////////////////////

--Trigger for after insert in custom_fields table

DROP TRIGGER IF EXISTS after_custom_field;

DELIMITER $$

CREATE TRIGGER after_custom_field
AFTER INSERT
ON custom_fields FOR EACH ROW
BEGIN
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE s_emp_id int(11) DEFAULT 0;
    DECLARE custom_field_value_id int(11) DEFAULT 0;
    
    -- declare cursor for employee id
	DEClARE curEmployee
		CURSOR FOR 
			SELECT emp_id FROM employees;

	-- declare NOT FOUND handler
	DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
    
	INSERT INTO custom_field_values (custom_field_id, custom_field_value)
    VALUES (NEW.custom_field_id, 'Default');
    SET custom_field_value_id = LAST_INSERT_ID();

	OPEN curEmployee;

	getId: LOOP
		FETCH curEmployee INTO s_emp_id;
		IF finished = 1 THEN 
			LEAVE getId;
		END IF;
		-- binsert quesry
		INSERT INTO employee_additional_details
        VALUES (s_emp_id, custom_field_value_id);
	END LOOP getId;
	CLOSE curEmployee;
END$$

DELIMITER ;

-- ///////////////////////////////////////////////////////////////////////////
-- on insert in pay grade level

DROP TRIGGER IF EXISTS after_pay_grade;

DELIMITER $$
CREATE TRIGGER after_pay_grade
AFTER INSERT
ON pay_grades FOR EACH ROW
BEGIN
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE leave_type int(11) DEFAULT 0;
    
    -- declare cursor for employee id
	DEClARE curLeaveTypes
		CURSOR FOR 
			SELECT leave_type_id FROM leave_types;

	-- declare NOT FOUND handler
	DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;

	OPEN curLeaveTypes;

	getLeaveLoop: LOOP
		FETCH curLeaveTypes INTO leave_type;
		IF finished = 1 THEN 
			LEAVE getLeaveLoop;
		END IF;
		-- binsert quesry
		INSERT INTO max_leave_days
        VALUES (leave_type, NEW.pay_grade_level, 0);
	END LOOP getLeaveLoop;
	CLOSE curLeaveTypes;
END$$
DELIMITER ;

-- ///////////////////////////////////////////////////////////////////////////
-- on insert in pay leave_type

DROP TRIGGER IF EXISTS after_leave_type;

DELIMITER $$
CREATE TRIGGER after_leave_type
AFTER INSERT
ON leave_types FOR EACH ROW
BEGIN
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE pay_grade int(11) DEFAULT 0;
    
    -- declare cursor for employee id
	DEClARE curPayGrade
		CURSOR FOR 
			SELECT pay_grade_level FROM pay_grades;

	-- declare NOT FOUND handler
	DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;

	OPEN curPayGrade;

	getPayLoop: LOOP
		FETCH curPayGrade INTO pay_grade;
		IF finished = 1 THEN 
			LEAVE getPayLoop;
		END IF;
		-- binsert quesry
		INSERT INTO max_leave_days
        VALUES (NEW.leave_type_id, pay_grade, 0);
	END LOOP getPayLoop;
	CLOSE curPayGrade;
END$$
DELIMITER ;

-- ////////////////////////////////////////////////////////
-- before del pay grade and leave type

DROP TRIGGER IF EXISTS before_del_paygrade;

CREATE TRIGGER before_del_paygrade
BEFORE DELETE
ON pay_grades FOR EACH ROW
    DELETE FROM max_leave_days WHERE pay_grade_level=OLD.pay_grade_level;

DROP TRIGGER IF EXISTS before_del_leave_Type;

CREATE TRIGGER before_del_leave_Type
BEFORE DELETE
ON leave_types FOR EACH ROW
    DELETE FROM max_leave_days WHERE leave_type_id=OLD.leave_type_id;


-- ////////////////////////////////////////////////////////
-- before del user_level and menus

DROP TRIGGER IF EXISTS before_del_userlevel;

CREATE TRIGGER before_del_userlevel
BEFORE DELETE
ON user_levels FOR EACH ROW
    DELETE FROM menu_permissions WHERE user_level=OLD.user_level;

DROP TRIGGER IF EXISTS before_del_menu;

CREATE TRIGGER before_del_menu
BEFORE DELETE
ON menus FOR EACH ROW
    DELETE FROM menu_permissions WHERE menu_id=OLD.menu_id;

