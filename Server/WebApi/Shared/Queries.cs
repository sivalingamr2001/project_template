namespace WebApi.Shared;

public static class Queries
{
    public const string AuthenticateComplianceUser = @"
        SELECT 
            CMPL_USER_ID as UserId, 
            emp_id as EmployeeId, 
            CMPL_USER_NAME as UserName, 
            MAIL_ID as Email,
            MOB_NO as Mobile,
            dept_id as DeptId
        FROM it_inventory_db_new.jan_complaint_login
        WHERE deleted_flag = 0 
            AND (CMPL_USER_NAME = @id OR emp_id = @id OR MAIL_ID = @id) 
            AND CMPL_USER_KEY = @pwd 
        LIMIT 1;";

    public const string FetchPortalUserAuthorization = @"
        SELECT role, location 
        FROM jan_itaccessreq_db.jan_portal_users 
        WHERE user_id = @UserId 
        LIMIT 1;";

    public const string CreateDefaultPortalUser = @"
        INSERT INTO jan_itaccessreq_db.jan_portal_users 
            (user_id, role, location, created_by) 
        VALUES 
            (@UserId, 4, 'Unknown', 'SystemFallback');";
}
