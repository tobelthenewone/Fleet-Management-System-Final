package com.zemenbank.fleetmanagement.service;
import java.util.List;

import com.zemenbank.fleetmanagement.dto.UserDTO;

public interface UserService {
    // get all users
    List<UserDTO> getAllUsers();
    // get user by id
    UserDTO getUserById(Long id);
    // activate user
    UserDTO activateUser(Long id);
    // deactivate user
    UserDTO deactivateUser(Long id);
    // update user
    UserDTO updateUser(Long id, UserDTO userDTO);
    // delete user
    void deleteUser(Long id);
    // fetch users by department
    List<UserDTO> getUsersByDepartment(Long departmentId);
}
