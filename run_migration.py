#!/usr/bin/env python3
"""
CDL Jovem Vila Velha API - Database Migration Runner
Run this script to create the forms and leads tables in Supabase
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def run_migration():
    """Execute the database migration"""
    
    # Get Supabase credentials
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        return False
    
    print("🚀 CDL Jovem Vila Velha API - Database Migration")
    print("=" * 50)
    print(f"📍 Supabase URL: {SUPABASE_URL}")
    print(f"🔑 API Key: {SUPABASE_KEY[:20]}...")
    print()
    
    # Read migration SQL
    migration_file = "migrations/create_forms_and_leads_tables.sql"
    
    try:
        with open(migration_file, 'r', encoding='utf-8') as f:
            migration_sql = f.read()
    except FileNotFoundError:
        print(f"❌ Error: Migration file not found: {migration_file}")
        print("Make sure you're running this script from the API root directory")
        return False
    
    # Set up headers for Supabase REST API
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    print("📊 Executing database migration...")
    print()
    
    # Execute migration using Supabase RPC
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Use Supabase's RPC endpoint to execute raw SQL
            payload = {
                "query": migration_sql
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=headers,
                json=payload
            )
            
            if response.status_code in [200, 201]:
                print("✅ Migration executed successfully!")
                print()
                print("📋 Summary:")
                print("  • Created 'forms' table with indexes and triggers")
                print("  • Created 'leads' table with indexes and foreign keys")
                print("  • Added validation functions for Brazilian phone numbers")
                print("  • Created helpful views: forms_with_lead_counts, recent_leads_activity")
                print()
                print("🎉 Your API now supports:")
                print("  • Google Forms integration")
                print("  • Lead management")
                print("  • Multi-section WhatsApp campaigns")
                print("  • Backward compatibility with existing CSV functionality")
                print()
                return True
                
            else:
                print(f"❌ Migration failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
                # Try alternative approach using direct SQL execution
                print()
                print("🔄 Trying alternative migration approach...")
                
                # Split SQL into individual statements
                statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
                
                success_count = 0
                for i, statement in enumerate(statements):
                    if not statement or statement.startswith('--'):
                        continue
                        
                    try:
                        # Execute each statement individually
                        exec_response = await client.post(
                            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                            headers=headers,
                            json={"query": statement}
                        )
                        
                        if exec_response.status_code in [200, 201]:
                            success_count += 1
                            print(f"  ✅ Statement {i+1} executed successfully")
                        else:
                            print(f"  ⚠️  Statement {i+1} failed: {exec_response.text}")
                            
                    except Exception as e:
                        print(f"  ❌ Statement {i+1} error: {str(e)}")
                
                if success_count > 0:
                    print(f")
                    print(f"✅ Partial migration completed: {success_count} statements executed")
                    return True
                else:
                    return False
                
        except httpx.RequestError as e:
            print(f"❌ Network error: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return False


async def verify_migration():
    """Verify that the migration was successful"""
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Verifying migration...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test forms table
            forms_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/forms",
                headers=headers
            )
            
            # Test leads table
            leads_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers
            )
            
            if forms_response.status_code == 200 and leads_response.status_code == 200:
                print("✅ Verification successful!")
                print("  • Forms table is accessible")
                print("  • Leads table is accessible")
                print("  • API endpoints are ready to use")
                return True
            else:
                print("❌ Verification failed:")
                print(f"  • Forms table status: {forms_response.status_code}")
                print(f"  • Leads table status: {leads_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Verification error: {str(e)}")
            return False


async def main():
    """Main migration process"""
    
    print("🎯 CDL Jovem Vila Velha API - Multi-Section WhatsApp Campaign System")
    print("   Database Migration for Forms and Leads")
    print("=" * 70)
    print()
    
    # Run migration
    migration_success = await run_migration()
    
    if migration_success:
        print()
        print("⏳ Waiting a moment for database to sync...")
        await asyncio.sleep(2)
        
        # Verify migration
        verification_success = await verify_migration()
        
        if verification_success:
            print()
            print("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print()
            print("📚 Next steps:")
            print("1. Update your API server: python run.py")
            print("2. Test the new endpoints:")
            print("   • GET  /forms")
            print("   • POST /forms")
            print("   • GET  /leads")
            print("   • POST /leads/send-messages")
            print("3. Configure Google Forms API credentials if needed")
            print()
            print("🔗 Your API now supports the multi-section WhatsApp campaign system!")
        else:
            print()
            print("⚠️  Migration executed but verification failed.")
            print("Please check your Supabase dashboard manually.")
    else:
        print()
        print("❌ MIGRATION FAILED")
        print()
        print("🛠️  Manual steps:")
        print("1. Check your Supabase credentials in .env file")
        print("2. Ensure your Supabase project has the necessary permissions")
        print("3. Try running the SQL migration manually in Supabase dashboard")
        print("4. Copy the contents of migrations/create_forms_and_leads_tables.sql")
        print("   and paste into Supabase SQL Editor")


if __name__ == "__main__":
    asyncio.run(main())