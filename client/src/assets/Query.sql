-- SQLite

-- 1. Insert 9 Departments (HOD starts as NULL)
INSERT INTO Departments (Id, Name, HodId) VALUES (1, 'Engineering', 101);
INSERT INTO Departments (Id, Name, HodId) VALUES (2, 'Finance', 102);
INSERT INTO Departments (Id, Name, HodId) VALUES (3, 'Human Resources', 103);
INSERT INTO Departments (Id, Name, HodId) VALUES (4, 'IT-Soft', 104);
INSERT INTO Departments (Id, Name, HodId) VALUES (5, 'IT-Hard', 105);
INSERT INTO Departments (Id, Name, HodId) VALUES (6, 'Marketing', 106);
INSERT INTO Departments (Id, Name, HodId) VALUES (7, 'Sales', 107);
INSERT INTO Departments (Id, Name, HodId) VALUES (8, 'Operations', 108);
INSERT INTO Departments (Id, Name, HodId) VALUES (9, 'Legal', 109);

-- 2. Insert 9 HOD Users (EmployeeIds 101-109)
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (101, 'Eng_HOD', 1, 'Building A', 98765401, 'eng_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (102, 'Fin_HOD', 2, 'Building A', 98765402, 'fin_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (103, 'HR_HOD', 3, 'Building A', 98765403, 'hr_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (104, 'ITS_HOD', 4, 'Building A', 98765404, 'its_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (105, 'ITH_HOD', 5, 'Building A', 98765405, 'ith_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (106, 'Mkt_HOD', 6, 'Building A', 98765406, 'mkt_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (107, 'Sls_HOD', 7, 'Building A', 98765407, 'sls_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (108, 'Ops_HOD', 8, 'Building A', 98765408, 'ops_hod@company.com', 'pass123', 'HOD');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (109, 'Lgl_HOD', 9, 'Building A', 98765409, 'lgl_hod@company.com', 'pass123', 'HOD');

-- 3. Update Departments with HOD IDs
UPDATE Departments SET HodId = 101 WHERE Id = 1;
UPDATE Departments SET HodId = 102 WHERE Id = 2;
UPDATE Departments SET HodId = 103 WHERE Id = 3;
UPDATE Departments SET HodId = 104 WHERE Id = 4;
UPDATE Departments SET HodId = 105 WHERE Id = 5;
UPDATE Departments SET HodId = 106 WHERE Id = 6;
UPDATE Departments SET HodId = 107 WHERE Id = 7;
UPDATE Departments SET HodId = 108 WHERE Id = 8;
UPDATE Departments SET HodId = 109 WHERE Id = 9;

-- 4. Insert 1 IT Admin User (EmployeeId 201)
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (201, 'IT_Admin', 4, 'Server Room', 12345678, 'it_admin@company.com', 'admin123', 'IT');

-- 5. Insert 10 General Users (EmployeeIds 301-310) spread across depts
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (301, 'John_Doe', 1, 'Office 1', 5550101, 'john@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (302, 'Jane_Smith', 2, 'Office 2', 5550102, 'jane@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (303, 'Alice_W', 3, 'Office 3', 5550103, 'alice@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (304, 'Bob_M', 4, 'Office 4', 5550104, 'bob@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (305, 'Charlie_D', 5, 'Office 5', 5550105, 'charlie@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (306, 'David_K', 6, 'Office 6', 5550106, 'david@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (307, 'Eve_P', 7, 'Office 7', 5550107, 'eve@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (308, 'Frank_R', 8, 'Office 8', 5550108, 'frank@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (309, 'Grace_L', 9, 'Office 9', 5550109, 'grace@company.com', 'user123', 'User');
INSERT INTO Users (EmployeeId, UserName, DepartmentId, Location, PhoneNumber, Email, Password, Role) VALUES (310, 'Hank_V', 1, 'Office 1', 5550110, 'hank@company.com', 'user123', 'User');

-- 1. TURN OFF ALL SAFETY CHECKS
PRAGMA foreign_keys = OFF;

-- 2. CLEAR EVERYTHING & RESET IDS
DELETE FROM Users;
DELETE FROM Departments;
DELETE FROM sqlite_sequence WHERE name = 'Users';
DELETE FROM sqlite_sequence WHERE name = 'Departments';

-- 3. INSERT DEPARTMENTS (Using placeholder IDs)
-- 1. Insert remaining 7 Departments (Assuming IT and HR exist from your C# code)
INSERT INTO Departments (Name) VALUES ('Engineering'), ('Finance'), ('Marketing'), ('Sales'), ('Operations'), ('Legal'), ('IT-Hard');

-- 2. Insert the remaining 7 HODs (EmployeeId 103-109)
-- These belong to the new departments created above
INSERT INTO Users (EmployeeId, UserName, Email, Password, Role, Location, PhoneNumber, DepartmentId) VALUES 
(103, 'Eng_HOD', 'eng_hod@company.com', 'password123', 'HOD', 'Chicago', 111222333, 3),
(104, 'Fin_HOD', 'fin_hod@company.com', 'password123', 'HOD', 'Chicago', 444555666, 4),
(105, 'Mkt_HOD', 'mkt_hod@company.com', 'password123', 'HOD', 'New York', 777888999, 5),
(106, 'Sls_HOD', 'sls_hod@company.com', 'password123', 'HOD', 'New York', 123123123, 6),
(107, 'Ops_HOD', 'ops_hod@company.com', 'password123', 'HOD', 'London', 456456456, 7),
(108, 'Lgl_HOD', 'lgl_hod@company.com', 'password123', 'HOD', 'London', 789789789, 8),
(109, 'ITH_HOD', 'ith_hod@company.com', 'password123', 'HOD', 'New York', 999000111, 9);

-- 3. Update the Departments table to link these HODs (Circular Reference)
-- Note: 'Id' in SQLite is usually Auto-Increment. Adjust IDs if they differ in your DB.
UPDATE Departments SET HodId = 103 WHERE Name = 'Engineering';
UPDATE Departments SET HodId = 104 WHERE Name = 'Finance';
UPDATE Departments SET HodId = 105 WHERE Name = 'Marketing';
UPDATE Departments SET HodId = 106 WHERE Name = 'Sales';
UPDATE Departments SET HodId = 107 WHERE Name = 'Operations';
UPDATE Departments SET HodId = 108 WHERE Name = 'Legal';
UPDATE Departments SET HodId = 109 WHERE Name = 'IT-Hard';

-- 4. Insert 9 more Regular Users (To make total 10 regular users)
-- EmployeeId 302-310 (Assuming Alice User is 301/4)
INSERT INTO Users (EmployeeId, UserName, Email, Password, Role, Location, PhoneNumber, DepartmentId) VALUES 
(302, 'Charlie Brown', 'charlie@company.com', 'user123', 'User', 'New York', 5550001, 1),
(303, 'David Miller', 'david@company.com', 'user123', 'User', 'Chicago', 5550002, 2),
(304, 'Eve Adams', 'eve@company.com', 'user123', 'User', 'London', 5550003, 3),
(305, 'Frank Wright', 'frank@company.com', 'user123', 'User', 'New York', 5550004, 4),
(306, 'Grace Hopper', 'grace@company.com', 'user123', 'User', 'Chicago', 5550005, 5),
(307, 'Henry Ford', 'henry@company.com', 'user123', 'User', 'London', 5550006, 6),
(308, 'Ivy Chen', 'ivy@company.com', 'user123', 'User', 'New York', 5550007, 7),
(309, 'Jack Sparrow', 'jack@company.com', 'user123', 'User', 'Chicago', 5550008, 8),
(310, 'Karen Page', 'karen@company.com', 'user123', 'User', 'London', 5550009, 9);

PRAGMA foreign_keys = ON;
