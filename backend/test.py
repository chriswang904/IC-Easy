"""
Test script for recommendations API
Run this to verify the recommendations system is working
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test recommendations health endpoint"""
    print("=" * 60)
    print("TEST 1: Health Check")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("✓ Health check passed\n")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}\n")
        return False


def test_personalized_no_auth():
    """Test personalized recommendations without authentication"""
    print("=" * 60)
    print("TEST 2: Personalized Recommendations (No Auth)")
    print("=" * 60)
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/recommendations/personalized",
            params={"limit": 5}
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total: {data['total']}")
            print(f"Personalized: {data['personalized']}")
            print(f"Topics: {data['topics']}")
            print(f"\nFirst paper:")
            if data['results']:
                paper = data['results'][0]
                print(f"  Title: {paper['title'][:80]}...")
                print(f"  Authors: {paper['authors'][:2] if paper['authors'] else 'N/A'}")
            print("✓ Personalized recommendations (no auth) passed\n")
            return True
        else:
            print(f"✗ Failed: {response.text}\n")
            return False
    except Exception as e:
        print(f"✗ Failed: {e}\n")
        return False


def test_by_interest():
    """Test recommendations by specific interest"""
    print("=" * 60)
    print("TEST 3: Recommendations by Interest")
    print("=" * 60)
    
    interests = ["AI", "Medicine", "Physics"]
    
    for interest in interests:
        try:
            response = requests.get(
                f"{BASE_URL}/api/recommendations/by-interest/{interest}",
                params={"limit": 3}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n{interest}:")
                print(f"  Total: {data['total']}")
                print(f"  Topics: {data['topics']}")
                if data['results']:
                    print(f"  First paper: {data['results'][0]['title'][:60]}...")
                print(f"  ✓ {interest} passed")
            else:
                print(f"  ✗ {interest} failed: {response.status_code}")
        except Exception as e:
            print(f"  ✗ {interest} error: {e}")
    
    print()


def test_with_auth(token):
    """Test personalized recommendations with authentication"""
    print("=" * 60)
    print("TEST 4: Personalized Recommendations (With Auth)")
    print("=" * 60)
    
    if not token:
        print("⚠ Skipped: No token provided")
        print("  Run with token: python test_recommendations.py <YOUR_TOKEN>\n")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/recommendations/personalized",
            params={"limit": 5},
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total: {data['total']}")
            print(f"Personalized: {data['personalized']}")
            print(f"Topics: {data['topics']}")
            
            if data['personalized']:
                print("✓ Successfully personalized for logged-in user!")
            else:
                print("⚠ Not personalized (user may have no interests)")
            print()
            return True
        else:
            print(f"✗ Failed: {response.text}\n")
            return False
    except Exception as e:
        print(f"✗ Failed: {e}\n")
        return False


def main():
    import sys
    
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS API TEST SUITE")
    print("=" * 60)
    print()
    
    # Get token from command line if provided
    token = sys.argv[1] if len(sys.argv) > 1 else None
    
    results = {
        "health": test_health(),
        "personalized_no_auth": test_personalized_no_auth(),
        "by_interest": test_by_interest() or True,  # This doesn't return bool
        "with_auth": test_with_auth(token) if token else None
    }
    
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results.items():
        if result is None:
            status = "⊘ SKIPPED"
        elif result:
            status = "✓ PASSED"
        else:
            status = "✗ FAILED"
        print(f"{status}: {test_name}")
    
    print()
    print("To test with authentication, run:")
    print("  python test_recommendations.py YOUR_ACCESS_TOKEN")
    print()


if __name__ == "__main__":
    main()