# 🏦 NetBank System | Enterprise Banking Architecture

![Java](https://img.shields.io/badge/Java-17%20LTS-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-green?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

O **NetBank System** é uma simulação de *Core Banking* desenvolvida com arquitetura Fullstack moderna, focada em alta performance, segurança transacional e escalabilidade. O projeto segue padrões de mercado utilizados por Fintechs e bancos digitais (Nubank, Revolut), implementando um **Monorepo** que integra uma API RESTful robusta com uma interface Client-Side reativa.

---

## 🛠️ Stack Tecnológica & Versões

A escolha da stack priorizou estabilidade (LTS) e compatibilidade com ambientes Cloud (AWS/Azure).

### ☕ Back-end (Core API)
* **Linguagem:** Java 17 LTS (Amazon Corretto Distro) - Foco em performance e garbage collection otimizado.
* **Framework:** Spring Boot 3.2.0 - Aproveitando a stack nativa e Jakarta EE.
* **Persistência:** Spring Data JPA + Hibernate (ORM).
* **Validação:** Bean Validation (Hibernate Validator).
* **Utilitários:** Lombok (Redução de boilerplate) e ModelMapper.
* **Build Tool:** Maven 3.8+.

### ⚛️ Front-end (Client & Admin)
* **Runtime:** Node.js 20+ (LTS).
* **Framework:** React 18.2 (Hooks & Functional Components).
* **Build Tool:** Vite 5 (Build ultra-rápido com ESModules).
* **Estilização:** TailwindCSS 3.4 (Utility-First Architecture).
* **UX/UI:** Framer Motion (Animações declarativas) & Lucide React (Ícones vetoriais).
* **HTTP Client:** Axios (Interceptors & Async/Await).

### 🏗️ Infraestrutura & DevOps
* **Database:** PostgreSQL 15 (Imagem Oficial Docker).
* **Containerização:** Docker Compose V2 (Orquestração de serviços).
* **Versionamento:** Git com estratégia de Monorepo.

---

## 📐 Arquitetura do Sistema

O sistema foi desenhado seguindo os princípios de **Clean Code** e **SOLID**, garantindo manutenibilidade.

### Destaques de Engenharia:
1.  **Isolamento de Domínio:** Entidades JPA separadas dos DTOs (Data Transfer Objects) para segurança da API.
2.  **Service Layer Pattern:** Regras de negócio (ex: validação de saldo, lógica de Pix) encapsuladas em serviços, não nos Controllers.
3.  **Tratamento de Exceções Global:** `@ControllerAdvice` para padronização de erros HTTP (404, 400, 500) em JSON.
4.  **CORS Configurado:** Permissão explícita para comunicação segura entre o Front (Porta 5173) e Back (Porta 8080).

---

## ⚡ Quick Start (Rodando Localmente)

### Pré-requisitos
* **Docker Desktop** (Obrigatório para o Banco)
* **Java JDK 17** (Preferencialmente Amazon Corretto 17)
* **Node.js 18+**

### 1️⃣ Infraestrutura (Banco de Dados)
Suba o container do PostgreSQL em modo *detached*:
```bash
cd database
docker-compose up -d
2️⃣ Back-end (API)
Compile e execute a aplicação Spring Boot:

Bash
cd backend
# Windows
mvnw spring-boot:run
# Linux/Mac
./mvnw spring-boot:run
A API estará disponível em: http://localhost:8080

3️⃣ Front-end (Interface)
Instale as dependências e inicie o servidor de desenvolvimento Vite:

Bash
cd frontend
npm install
npm run dev
O App estará disponível em: http://localhost:5173