package com.zemenbank.fleetmanagement.service.impl;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zemenbank.fleetmanagement.dto.DepartmentDTO;
import com.zemenbank.fleetmanagement.dto.UserBriefDTO;
import com.zemenbank.fleetmanagement.dto.UserDTO;
import com.zemenbank.fleetmanagement.exception.ResourceNotFoundException;
import com.zemenbank.fleetmanagement.model.User;
import com.zemenbank.fleetmanagement.repository.DepartmentRepository;
import com.zemenbank.fleetmanagement.repository.UserRepository;
import com.zemenbank.fleetmanagement.service.UserService;

import lombok.RequiredArgsConstructor;;

/**
 * Service implementation for managing users in the fleet management system.
 * 
 * This class provides business logic for:
 * - Creating, updating, activating, and deactivating users
 * - Deleting users
 * - Mapping between User and UserDTO
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
        private final UserRepository userRepository;
        private final DepartmentServiceImpl departmentServiceImpl;
        private final DepartmentRepository departmentRepository;


        /**
         * Retrieves all users in the system, filtering out users with null roles.
         * @return List of all user DTOs
         */
        @Override
        public List<UserDTO> getAllUsers() {
                return userRepository.findAll().stream()
                        .map(user -> mapToDTO(user))
                        .filter(userDTO -> userDTO.getRole() != null) // filter out users with null role
                        .collect(Collectors.toList());
        }

        /**
         * Retrieves a user by their unique ID.
         * @param id The user ID
         * @return The user DTO
         */
        @Override
        public UserDTO getUserById(Long id) {
                return userRepository.findById(id)
                        .map(user -> mapToDTO(user))
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        }
        /**
         * Activates a user account by setting its status to ACTIVE.
         * @param id The user ID
         * @return The activated user DTO
         */
        @Override
        public UserDTO activateUser(Long id) {
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
                // user.setAccountStatus(AccountStatus.ACTIVE);
                var activatedUser= userRepository.save(user);
                return mapToDTO(activatedUser);
        }
        /**
         * Deactivates a user account by setting its status to INACTIVE.
         * @param id The user ID
         * @return The deactivated user DTO
         */
        @Override
        public UserDTO deactivateUser(Long id) {
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
                // user.setAccountStatus(AccountStatus.INACTIVE);
                var deactivatedUser= userRepository.save(user);
                return mapToDTO(deactivatedUser);
        }

        /**
         * Updates an existing user's information, including department if provided.
         * @param id The user ID
         * @param userDTO The updated user data
         * @return The updated user DTO
         */
        @Override
        public UserDTO updateUser(Long id, UserDTO userDTO) {
                System.out.println("Update user called with id: " + id + " and userDTO: " + userDTO);
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                // Update user fields
                user.setName(userDTO.getName());
                user.setUsername(userDTO.getUsername());
                // user.setPhoneNumber(userDTO.getPhoneNumber());
                user.setRole(userDTO.getRole());

                // Optionally update department if provided
                if (userDTO.getDepartmentId() != null) {
                        user.setDepartment(departmentRepository.findById(userDTO.getDepartmentId())
                                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + userDTO.getDepartmentId())));
                }
                System.out.println("User before saving: " + user);
                User updatedUser = userRepository.save(user);
                return mapToDTO(updatedUser);
        }
        /**
         * Deletes a user by their unique ID.
         * @param id The user ID
         */
        @Override
        public void deleteUser(Long id) {
                if (!userRepository.existsById(id)) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                }
                userRepository.deleteById(id);
        }

        /**
         * Maps a User entity to a UserDTO, including department mapping.
         * @param user The user entity
         * @return The user DTO
         */
        UserDTO mapToDTO(User user) {
                if (user == null) return null;

                // Optionally map department if needed
                DepartmentDTO departmentDTO = user.getDepartment() != null
                        ? departmentServiceImpl.mapToDTO(user.getDepartment())
                        : null;

                return UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .username(user.getUsername())
                        // .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole())
                        .department(departmentDTO)
                        // .accountStatus(user.getAccountStatus())
                        .build();
        }

        @Override
        public List<UserDTO> getUsersByDepartment(Long departmentId) {
                List<User> users = userRepository.findByDepartmentId(departmentId);
                var userDTOs = new ArrayList<UserDTO>();
                for (User user : users) {
                        UserDTO userDTO = mapToDTO(user);
                        userDTOs.add(userDTO);
                }
                return userDTOs;
        }


        UserBriefDTO mapToUserBriefDTO(User user) {
                if (user == null) return null;

                return UserBriefDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .build();
        }
}
