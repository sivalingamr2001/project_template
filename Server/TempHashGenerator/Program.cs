using System;

var salt = "$2a$11$1234567890123456789012";
Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("password", salt));
Console.WriteLine(BCrypt.Net.BCrypt.Verify("password", BCrypt.Net.BCrypt.HashPassword("password", salt)));
