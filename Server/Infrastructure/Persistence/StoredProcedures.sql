-- Stored procedures for access request workflow

DELIMITER $$

CREATE PROCEDURE sp_CreateAccessRequest(
    IN p_EmpId INT,
    IN p_ITSRNumber VARCHAR(100),
    IN p_IsAgreed BOOLEAN,
    IN p_IsRevoke BOOLEAN,
    IN p_CreatedBy VARCHAR(100),
    OUT p_RequestId INT
)
BEGIN
    INSERT INTO Jan_Access_Request (EmpId, Status, IsAgreed, ITSRNumber, IsRevoke, IsActive, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy)
    VALUES (p_EmpId, 'Pending', p_IsAgreed, p_ITSRNumber, p_IsRevoke, TRUE, UTC_TIMESTAMP(), p_CreatedBy, UTC_TIMESTAMP(), p_CreatedBy);

    SET p_RequestId = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_AddAccessDetail(
    IN p_RequestId INT,
    IN p_FolderPath VARCHAR(500),
    IN p_AccessType VARCHAR(50),
    IN p_Reason VARCHAR(500),
    IN p_ExpiredAt DATETIME,
    IN p_CreatedBy VARCHAR(100),
    OUT p_DetailId INT
)
BEGIN
    INSERT INTO Jan_Access_Details (AccessRequestId, FolderPath, AccessType, Reason, ExpiredAt, Status, IsActive, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy)
    VALUES (p_RequestId, p_FolderPath, p_AccessType, p_Reason, p_ExpiredAt, 'Pending', TRUE, UTC_TIMESTAMP(), p_CreatedBy, UTC_TIMESTAMP(), p_CreatedBy);

    SET p_DetailId = LAST_INSERT_ID();

    INSERT INTO Jan_Access_Approval (AccessDetailId, ApproverEmpId, ApprovalLevel, Status, Comments, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy)
    VALUES (p_DetailId, 0, 1, 'Pending', NULL, UTC_TIMESTAMP(), p_CreatedBy, UTC_TIMESTAMP(), p_CreatedBy),
           (p_DetailId, 0, 2, 'Pending', NULL, UTC_TIMESTAMP(), p_CreatedBy, UTC_TIMESTAMP(), p_CreatedBy);
END$$

CREATE PROCEDURE sp_UpdateApproval(
    IN p_ApprovalId INT,
    IN p_Status VARCHAR(50),
    IN p_Comments VARCHAR(1000),
    IN p_ApproverEmpId INT,
    IN p_ModifiedBy VARCHAR(100)
)
BEGIN
    UPDATE Jan_Access_Approval
    SET Status = p_Status,
        Comments = p_Comments,
        ApproverEmpId = p_ApproverEmpId,
        ModifiedOn = UTC_TIMESTAMP(),
        ModifiedBy = p_ModifiedBy
    WHERE Id = p_ApprovalId;

    IF p_Status = 'Rejected' THEN
        UPDATE Jan_Access_Details
        SET Status = 'Rejected', ModifiedOn = UTC_TIMESTAMP(), ModifiedBy = p_ModifiedBy
        WHERE Id = (SELECT AccessDetailId FROM Jan_Access_Approval WHERE Id = p_ApprovalId);
    ELSEIF p_Status = 'Approved' THEN
        UPDATE Jan_Access_Details d
        SET d.Status = 'Approved', d.ModifiedOn = UTC_TIMESTAMP(), d.ModifiedBy = p_ModifiedBy
        WHERE d.Id = (SELECT AccessDetailId FROM Jan_Access_Approval WHERE Id = p_ApprovalId)
          AND NOT EXISTS (
              SELECT 1 FROM Jan_Access_Approval a
              WHERE a.AccessDetailId = d.Id AND a.Status <> 'Approved');
    END IF;
END$$

DELIMITER ;
