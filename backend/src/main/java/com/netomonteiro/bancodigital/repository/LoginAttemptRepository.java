package com.netomonteiro.bancodigital.repository;

import com.netomonteiro.bancodigital.model.LoginAttempt;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select la from LoginAttempt la where la.loginKey = :loginKey")
    Optional<LoginAttempt> findByLoginKeyForUpdate(@Param("loginKey") String loginKey);
}
