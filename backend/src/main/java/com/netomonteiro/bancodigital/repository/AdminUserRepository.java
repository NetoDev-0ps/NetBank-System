package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.AdminUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByEmailIgnoreCase(String email);

    Optional<AdminUser> findByIdAndAtivoTrue(Long id);
}