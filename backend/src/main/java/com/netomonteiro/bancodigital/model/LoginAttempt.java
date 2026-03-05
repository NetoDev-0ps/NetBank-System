package com.netomonteiro.bancodigital.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "login_attempt")
@Getter
@Setter
@NoArgsConstructor
public class LoginAttempt {

    @Id
    @Column(name = "login_key", nullable = false, length = 255)
    private String loginKey;

    @Column(nullable = false)
    private int failures = 0;

    @Column(name = "first_failure_at")
    private LocalDateTime firstFailureAt;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public LoginAttempt(String loginKey) {
        this.loginKey = loginKey;
    }

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }
}