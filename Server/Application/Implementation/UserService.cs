using AutoMapper;
using System;
using System.Threading.Tasks;
using Application.Contracts;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Domain.DomainEntities;
using Domain.RepositoryInterface;
using Domain.DomainEnums;

namespace Application.Implementation
{
    public class UserService(
              IUserRepository userRepository
            , IMapper mapper) : IUserService
    {

        public async Task<bool> CreateUserAsync(CreateUserDto userDto)
        {
            var userDomain = mapper.Map<UserDomain>(userDto);
            userDomain.Password =userDomain.Password;
            userDomain.Role = UserRoles.User; // Default role
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
            var userDomain = users.FirstOrDefault(u => u.Email == loginRequest.Email) ?? throw new UnauthorizedAccessException("Invalid email or password");

            var IsPasswordValid = userDomain.Password == loginRequest.Password;

            // Generate simple token (just user data for now - no JWT as per requirements)
            var accessToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:{DateTime.UtcNow.Ticks}"));
            var refreshToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:refresh:{DateTime.UtcNow.Ticks}"));

            var userResponse = new UserResponseDto(
                userDomain.Id.ToString(),
                userDomain.Email,
                userDomain.FullName,
                userDomain.Role.ToString()
            );

            return new LoginResponseDto(userResponse, accessToken, refreshToken);
        }
    }
}

