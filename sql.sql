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
primary key (pay_grade_level)
);

create table employement_statuses(
emp_status_id int not null auto_increment,
emp_status varchar(50),
primary key (emp_status_id)
);

create table employees (
    emp_id int not null auto_increment,
    firstname varchar(50) not null,
    lastname varchar (50) not null,
    birthdate date,
    martial_status varchar(10),
    dept_id int(11),
    job_id int(11),
    emp_status_id int(11),
    pay_grade_level int(11),
    supervisor int(11),
    primary key(emp_id),
	foreign key (dept_id) references departments(dept_id),
	foreign key (job_id) references job_titles(job_id),
    FOREIGN KEY (emp_status_id) REFERENCES employement_statuses(emp_status_id),
	foreign key (pay_grade_level) references pay_grades(pay_grade_level),
    FOREIGN KEY (supervisor) REFERENCES employees(emp_id)
);

CREATE TABLE organization_details (
    org_id int not null AUTO_INCREMENT,
    org_name varchar(50),
    registration_number int(11),
    address varchar(50),
    admin_username varchar(50),
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
    user_level int(11),
    PASSWORD varchar(50),
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
    title varchar(50),
    PRIMARY KEY (leave_id)
);

CREATE TABLE max_leave_days (
    leave_type_id int(11),
    pay_grade_level int(11),
    no_of_leaves int(3),
    PRIMARY KEY (leave_id, pay_grade_level),
    FOREIGN KEY (leave_id) REFERENCES leave_types(leave_id),
    FOREIGN KEY (pay_grade_level) REFERENCES pay_grades(pay_grade_level)
);

CREATE TABLE leave_applications (
    emp_id int(11) not null,
    apply_date_time datetime not null,
    leave_type_id int(11) not null,
    period int(3),
    status_id int(1),
    PRIMARY KEY (emp_id, apply_date_time),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
    FOREIGN KEY (status_id) REFERENCES leave_application_statuses(status_id),
);

CREATE TABLE leave_application_statuses (
    status_id int AUTO_INCREMENT,
    title varchar(50),
    PRIMARY KEY (status_id)
);

--/////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS employeesProcedure;
DELIMITER $$
CREATE PROCEDURE employeesProcedure ()
BEGIN
	SET @sql = NULL;
    SELECT
      GROUP_CONCAT(DISTINCT
        CONCAT(
            'GROUP_CONCAT((CASE custom_field_id when ',
            custom_field_id,
            ' then custom_field_value else NULL END)) AS ',
            custom_field_name,
            ', ',
            'GROUP_CONCAT((CASE custom_field_id when ',
            custom_field_id,
            ' then custom_field_id else NULL END)) AS ',
            custom_field_name, '_id'
        )
      ) INTO @sql
    FROM employee_additional_details natural join custom_field_values natural join custom_fields;


    SET @sql = CONCAT('CREATE OR REPLACE VIEW employees_details AS SELECT
                        e.firstname, e.lastname, e.birthdate, e.martial_status, e.dept_id, e.job_id, e.emp_status_id, e.pay_grade_level pay_grade_level_id,
                        additional.*,
                        d.name department, p.pay_grade_level_title pay_grade_level, j.job_title_name job_title,
                        u.username
                        FROM employees e natural join (
                        SELECT emp_id, ', @sql, ' 
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

-- ///////////////////////////////////////////////////
-- menupermission procedure

DROP PROCEDURE IF EXISTS menuPermission;
DELIMITER $$
CREATE PROCEDURE menuPermission ()
BEGIN
	SET @sql = NULL;
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


    SET @sql = CONCAT('CREATE OR REPLACE VIEW pivoted_menu_permissions AS SELECT
                        *
                        FROM menus m NATURAL LEFT OUTER JOIN (
                        SELECT menu_id, ', @sql, ' 
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