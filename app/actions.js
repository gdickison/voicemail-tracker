"use server";
import { neon } from "@neondatabase/serverless";

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);

/**
 * Initialize the database with the required tables
 */
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS voicemails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        from_name TEXT NOT NULL,
        to_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        message_content TEXT NOT NULL,
        date_time TIMESTAMP WITH TIME ZONE NOT NULL,
        taken_by TEXT NOT NULL,
        returned BOOLEAN DEFAULT FALSE,
        returned_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

/**
 * Create a new user and return their ID
 */
export async function createUser() {
  try {
    const result = await sql`
      INSERT INTO users (id)
      VALUES (gen_random_uuid())
      RETURNING id
    `;
    return result[0].id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Get or create a user ID (for session management)
 */
export async function getOrCreateUserId(userId) {
  if (!userId || userId === 'Loading...' || userId.startsWith('Error')) {
    return await createUser();
  }
  
  // Verify the user exists
  try {
    const result = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;
    
    if (result.length === 0) {
      return await createUser();
    }
    
    return userId;
  } catch (error) {
    console.error("Error verifying user:", error);
    return await createUser();
  }
}

/**
 * Get all voicemails for a user that haven't been returned
 */
export async function getVoicemails(userId) {
  try {
    const result = await sql`
      SELECT 
        id,
        from_name,
        to_name,
        phone_number,
        message_content,
        date_time,
        taken_by,
        returned,
        returned_at,
        created_at
      FROM voicemails 
      WHERE user_id = ${userId} AND returned = FALSE
      ORDER BY date_time DESC
    `;
    
    return result.map(row => ({
      id: row.id,
      fromName: row.from_name,
      toName: row.to_name,
      phoneNumber: row.phone_number,
      messageContent: row.message_content,
      dateTime: row.date_time,
      takenBy: row.taken_by,
      returned: row.returned,
      returnedAt: row.returned_at,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching voicemails:", error);
    throw error;
  }
}

/**
 * Add a new voicemail
 */
export async function addVoicemail(userId, voicemailData) {
  try {
    const result = await sql`
      INSERT INTO voicemails (
        user_id,
        from_name,
        to_name,
        phone_number,
        message_content,
        date_time,
        taken_by
      ) VALUES (
        ${userId},
        ${voicemailData.fromName},
        ${voicemailData.toName},
        ${voicemailData.phoneNumber},
        ${voicemailData.messageContent},
        ${voicemailData.dateTime},
        ${voicemailData.takenBy}
      )
      RETURNING id
    `;
    
    return result[0].id;
  } catch (error) {
    console.error("Error adding voicemail:", error);
    throw error;
  }
}

/**
 * Delete a voicemail
 */
export async function deleteVoicemail(userId, voicemailId) {
  try {
    await sql`
      DELETE FROM voicemails 
      WHERE id = ${voicemailId} AND user_id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error("Error deleting voicemail:", error);
    throw error;
  }
}

/**
 * Mark a voicemail as returned
 */
export async function markVoicemailAsReturned(userId, voicemailId) {
  try {
    await sql`
      UPDATE voicemails 
      SET returned = TRUE, returned_at = NOW()
      WHERE id = ${voicemailId} AND user_id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error("Error marking voicemail as returned:", error);
    throw error;
  }
} 