"use server";
import { neon } from "@neondatabase/serverless";

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);

// Test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected successfully:', result[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get all voicemails that haven't been returned
 */
export async function getVoicemails() {
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
      WHERE returned = FALSE
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
export async function addVoicemail(voicemailData) {
  try {
    const result = await sql`
      INSERT INTO voicemails (
        from_name,
        to_name,
        phone_number,
        message_content,
        date_time,
        taken_by
      ) VALUES (
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
export async function deleteVoicemail(voicemailId) {
  try {
    await sql`
      DELETE FROM voicemails 
      WHERE id = ${voicemailId}
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
export async function markVoicemailAsReturned(voicemailId) {
  try {
    await sql`
      UPDATE voicemails 
      SET returned = TRUE, returned_at = NOW()
      WHERE id = ${voicemailId}
    `;
    
    return true;
  } catch (error) {
    console.error("Error marking voicemail as returned:", error);
    throw error;
  }
} 