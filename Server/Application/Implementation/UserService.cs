using AutoMapper;
using System;
using System.Threading.Tasks;
using Application.Contracts;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Domain.DomainEntities;
using Domain.RepositoryInterface;

namespace Application.Implementation
{
    public class UserService(
              IUserRepository userRepository
            , IMapper mapper) : IUserService
    {

        public async Task<bool> CreateUserAsync(CreateUserDto userDto)
        {
            var userDomain = mapper.Map<UserDomain>(userDto);
            userDomain.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDomain.PasswordHash);
            userDomain.Role = "viewer"; // Default role
            userDomain.CreatedAt = DateTime.UtcNow;
            userDomain.UpdatedAt = DateTime.UtcNow;
            
            await userRepository.AddAsync(userDomain);
            var response = await userRepository.CommitAsync();

            return response > 0;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest)
        {
            // Find user by email
            var users = await userRepository.GetAllAsync();
            var userDomain = users.FirstOrDefault(u => u.Email == loginRequest.Email);

            if (userDomain == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Verify password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, userDomain.PasswordHash);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Generate simple token (just user data for now - no JWT as per requirements)
            var accessToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:{DateTime.UtcNow.Ticks}"));
            var refreshToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:refresh:{DateTime.UtcNow.Ticks}"));

            var userResponse = new UserResponseDto(
                userDomain.Id.ToString(),
                userDomain.Email,
                userDomain.FullName,
                userDomain.Role,
                userDomain.AvatarUrl
            );

            return new LoginResponseDto(userResponse, accessToken, refreshToken);
        }
    }
}

