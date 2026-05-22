using AutoMapper;
using System;
using System.Threading.Tasks;
using Application.Contracts;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Utils;
using Domain.DomainEntities;
using Domain.RepositoryInterface;

namespace Application.Implementation
{
    public class UserService(
              IUserRepository userRepository
            , IMapper mapper
            , IJwtService jwtService
            , IPasswordHasher passwordHasher) : IUserService
    {

        public async Task<bool> CreateUserAsync(CreateUserDto userDto)
        {
            var userDomain = mapper.Map<UserDomain>(userDto);
            // Hash the password using BCrypt
            userDomain.PasswordHash = passwordHasher.HashPassword(userDto.Password);
            userDomain.Role = "viewer"; // Default role for new users
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

            // Verify password using BCrypt
            bool isPasswordValid = passwordHasher.VerifyPassword(loginRequest.Password, userDomain.PasswordHash);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Generate JWT tokens
            var accessToken = jwtService.GenerateAccessToken(
                userDomain.Id,
                userDomain.Email,
                userDomain.Role,
                userDomain.FullName
            );
            var refreshToken = jwtService.GenerateRefreshToken();

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
