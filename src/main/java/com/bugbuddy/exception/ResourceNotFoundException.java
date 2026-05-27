package com.bugbuddy.exception;

/**
 * Thrown when a requested resource (e.g., Bug by ID) is not found in the database.
 * Maps to HTTP 404 Not Found via GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * @param resourceName  Name of the entity (e.g., "Bug")
     * @param fieldName     Name of the lookup field (e.g., "id")
     * @param fieldValue    Value that was searched for (e.g., 42)
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
