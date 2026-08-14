package com.example.happyheels.config;

import com.example.happyheels.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no authentication needed
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/products/**").permitAll() // Anyone can view products list
                        .requestMatchers("/api/product/*/image").permitAll() // ✅ Public: product images
                        .requestMatchers("/api/reviews/product/**").permitAll() // ✅ Public: view product reviews

                        // Allow GET requests to individual products (view product details)
                        .requestMatchers("GET", "/api/product/*").permitAll()

                        // Admin only endpoints (POST, PUT, DELETE operations)
                        .requestMatchers("/api/product").hasRole("ADMIN") // POST: Add product
                        .requestMatchers("/api/product/*").hasRole("ADMIN") // PUT, DELETE: Update/Delete product
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // Future admin endpoints
                        .requestMatchers("/api/reviews/admin/**").hasRole("ADMIN") // ✅ Admin: manage all reviews

                        // Order endpoints (temporarily public for testing)
                        .requestMatchers("/api/orders").permitAll() // POST: Create order - TEMPORARILY PUBLIC FOR TESTING
                        .requestMatchers("/api/orders/my-orders").authenticated() // GET: User's orders
                        .requestMatchers("/api/orders/*").authenticated() // GET: Specific order
                        .requestMatchers("/api/orders/*/bank-slip").authenticated() // GET: Bank slip
                        .requestMatchers("/api/orders/admin/**").hasRole("ADMIN") // Admin order management

                        // User endpoints (require login but not necessarily admin)
                        .requestMatchers("/api/auth/me").authenticated() // ✅ User profile endpoints
                        .requestMatchers("/api/auth/validate").authenticated() // ✅ Token validation endpoint
                        .requestMatchers("/api/user/**").authenticated() // User profile, etc.
                        .requestMatchers("/api/cart/**").authenticated() // Cart endpoints
                        .requestMatchers("/api/reviews").authenticated() // ✅ Users: add reviews

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://frontend5-ten.vercel.app")); // explicit origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // important if you send JWT/cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}