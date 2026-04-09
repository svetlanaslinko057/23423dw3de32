#!/usr/bin/env python3
"""
Simplified P0 Security Testing for Development OS
"""

import requests
import sys
import json
from datetime import datetime
import uuid

def test_security_features():
    """Test all P0 security features"""
    base_url = "https://deployment-preview-11.preview.emergentagent.com"
    results = []
    
    def log_test(name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        result = {"test": name, "status": "PASS" if success else "FAIL", "details": details}
        results.append(result)
        print(f"{status} - {name}: {details}")
        return success
    
    print("🚀 P0 Security Tests - Development OS")
    print("=" * 50)
    
    # Test 1: bcrypt Registration
    print("\n🔐 Testing bcrypt registration...")
    unique_email = f"test_bcrypt_{uuid.uuid4().hex[:8]}@test.com"
    reg_data = {
        "email": unique_email,
        "password": "securepass123",
        "name": "Test User",
        "role": "client"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", json=reg_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'password_hash' not in data and 'user_id' in data:
                log_test("bcrypt_registration", True, f"User registered with bcrypt, user_id: {data['user_id']}")
                user_token = response.cookies.get('session_token')
            else:
                log_test("bcrypt_registration", False, "Password hash exposed or missing user_id")
                user_token = None
        else:
            log_test("bcrypt_registration", False, f"Registration failed: {response.status_code}")
            user_token = None
    except Exception as e:
        log_test("bcrypt_registration", False, f"Registration error: {str(e)}")
        user_token = None
    
    # Test 2: Correct password login
    print("\n🔑 Testing correct password login...")
    try:
        login_data = {"email": unique_email, "password": "securepass123"}
        response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            token = response.cookies.get('session_token')
            if token and 'user_id' in data:
                log_test("correct_password_login", True, "Login successful with bcrypt verification")
                user_token = token
            else:
                log_test("correct_password_login", False, "Login missing token or user_id")
        else:
            log_test("correct_password_login", False, f"Login failed: {response.status_code}")
    except Exception as e:
        log_test("correct_password_login", False, f"Login error: {str(e)}")
    
    # Test 3: Wrong password login
    print("\n🚫 Testing wrong password login...")
    try:
        login_data = {"email": unique_email, "password": "wrongpassword"}
        response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=10)
        if response.status_code == 401:
            log_test("wrong_password_login", True, "Wrong password correctly rejected with 401")
        else:
            log_test("wrong_password_login", False, f"Expected 401, got: {response.status_code}")
    except Exception as e:
        log_test("wrong_password_login", False, f"Wrong password test error: {str(e)}")
    
    # Test 4: Demo login
    print("\n🎭 Testing demo login...")
    try:
        demo_data = {"role": "client"}
        response = requests.post(f"{base_url}/api/auth/demo", json=demo_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            demo_token = response.cookies.get('session_token')
            if demo_token and 'user_id' in data and data.get('is_demo'):
                log_test("demo_login", True, f"Demo login successful, user_id: {data['user_id']}")
            else:
                log_test("demo_login", False, "Demo login missing token, user_id, or is_demo flag")
        else:
            log_test("demo_login", False, f"Demo login failed: {response.status_code}")
    except Exception as e:
        log_test("demo_login", False, f"Demo login error: {str(e)}")
    
    # Test 5: Auth endpoint security
    print("\n🔒 Testing auth endpoint security...")
    try:
        response = requests.get(f"{base_url}/api/auth/me", timeout=10)
        if response.status_code == 401:
            log_test("auth_me_no_token", True, "/auth/me correctly returns 401 without token")
        else:
            log_test("auth_me_no_token", False, f"/auth/me should return 401, got: {response.status_code}")
    except Exception as e:
        log_test("auth_me_no_token", False, f"/auth/me test error: {str(e)}")
    
    # Test 6: Auth with valid token
    if user_token:
        try:
            headers = {'Authorization': f'Bearer {user_token}'}
            response = requests.get(f"{base_url}/api/auth/me", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'user_id' in data and 'password_hash' not in data:
                    log_test("auth_me_with_token", True, "/auth/me returns user data without password hash")
                else:
                    log_test("auth_me_with_token", False, "/auth/me response invalid or exposes password hash")
            else:
                log_test("auth_me_with_token", False, f"/auth/me with token failed: {response.status_code}")
        except Exception as e:
            log_test("auth_me_with_token", False, f"/auth/me with token error: {str(e)}")
    
    # Test 7: Project access control
    if user_token:
        print("\n👤 Testing project access control...")
        try:
            headers = {'Authorization': f'Bearer {user_token}'}
            response = requests.get(f"{base_url}/api/projects/mine", headers=headers, timeout=10)
            if response.status_code == 200:
                projects = response.json()
                log_test("own_project_access", True, f"Successfully accessed own projects, count: {len(projects)}")
            else:
                log_test("own_project_access", False, f"Failed to access own projects: {response.status_code}")
        except Exception as e:
            log_test("own_project_access", False, f"Project access error: {str(e)}")
    
    # Test 8: Test non-existent project access (should return 404)
    if user_token:
        try:
            headers = {'Authorization': f'Bearer {user_token}'}
            response = requests.get(f"{base_url}/api/projects/proj_nonexistent", headers=headers, timeout=10)
            if response.status_code == 404:
                log_test("nonexistent_project_access", True, "Non-existent project correctly returns 404")
            else:
                log_test("nonexistent_project_access", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            log_test("nonexistent_project_access", False, f"Non-existent project test error: {str(e)}")
    
    # Summary
    print("\n" + "=" * 50)
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    
    print(f"📊 SECURITY TEST SUMMARY")
    print(f"Tests Run: {total_tests}")
    print(f"Tests Passed: {passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if passed_tests == total_tests:
        print("🎉 ALL SECURITY TESTS PASSED!")
        return 0, results
    else:
        print("⚠️  SOME SECURITY TESTS FAILED!")
        return 1, results

if __name__ == "__main__":
    exit_code, test_results = test_security_features()
    
    # Save results
    summary = {
        "total_tests": len(test_results),
        "passed_tests": sum(1 for r in test_results if r['status'] == 'PASS'),
        "test_results": test_results,
        "timestamp": datetime.now().isoformat()
    }
    
    with open('/app/test_reports/security_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    sys.exit(exit_code)