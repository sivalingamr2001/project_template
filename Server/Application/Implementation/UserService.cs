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
            userDomain.EmployeeId = userDto.EmployeeId;
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
            // 1. Fetch all users from repository
            var users = await userRepository.GetAllAsync();

            // 2. Match against both Email and Username (Identifier)
            var userDomain = users.FirstOrDefault(u =>
                u.Email.Equals(loginRequest.Identifier, StringComparison.OrdinalIgnoreCase) ||
                u.EmployeeId.ToString().Equals(loginRequest.Identifier, StringComparison.OrdinalIgnoreCase))
                ?? throw new UnauthorizedAccessException("Invalid credentials");


            // 3. Validate the password
            var isPasswordValid = userDomain.Password == loginRequest.Password;
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            // 4. Generate tokens
            var accessToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:{DateTime.UtcNow.Ticks}"));
            var refreshToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userDomain.Id}:refresh:{DateTime.UtcNow.Ticks}"));

            var userResponse = new UserResponseDto(
                userDomain.Id.ToString(),
                userDomain.EmployeeId,
                userDomain.Email,
                userDomain.FullName,
                userDomain.Role.ToString()
            );

            return new LoginResponseDto(userResponse, accessToken, refreshToken);
        }

    }
}

