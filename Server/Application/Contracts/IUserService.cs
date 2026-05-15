using System;
using System.Collections.Generic;
using System.Text;
using Application.DTOs.Request;
using Application.DTOs.Response;

namespace Application.Contracts
{
    public interface IUserService
    {
        Task<bool> CreateUserAsync(CreateUserDto userDto);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest);
    }
}

