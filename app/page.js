// app/page.js
"use client"; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { 
  testConnection,
  getVoicemails, 
  addVoicemail as addVoicemailToDb, 
  deleteVoicemail as deleteVoicemailFromDb, 
  markVoicemailAsReturned as markVoicemailAsReturnedInDb 
} from './actions';

export default function Home() {
  // State variables for form inputs
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [takenBy, setTakenBy] = useState('');

  // State for voicemail list and UI elements
  const [voicemails, setVoicemails] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for database connection test
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test database connection
        const isConnected = await testConnection();
        
        if (isConnected) {
          // Load voicemails
          await loadVoicemails();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Loads voicemails from the database.
   */
  const loadVoicemails = async () => {
    try {
      const fetchedVoicemails = await getVoicemails();
      setVoicemails(fetchedVoicemails);
    } catch (error) {
      console.error("Error loading voicemails: ", error);
    }
  };

  /**
   * Handles the form submission to add a new voicemail.
   * @param {Event} event - The form submission event.
   */
  const addVoicemail = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (isLoading) {
      console.error("Database not ready yet.");
      return;
    }

    try {
      await addVoicemailToDb({
        fromName,
        toName,
        phoneNumber,
        messageContent,
        dateTime,
        takenBy
      });
      
      console.log("Voicemail added successfully!");
      
      // Reload voicemails to show the new one
      await loadVoicemails();
      
      // Clear the form fields
      setFromName('');
      setToName('');
      setPhoneNumber('');
      setMessageContent('');
      setDateTime('');
      setTakenBy('');
    } catch (e) {
      console.error("Error adding voicemail: ", e);
    }
  };

  /**
   * Displays the confirmation modal for deletion.
   * @param {string} id - The document ID of the voicemail to delete.
   */
  const confirmDelete = (id) => {
    setDeleteDocId(id);
    setShowConfirmationModal(true);
  };

  /**
   * Hides the confirmation modal.
   */
  const cancelDelete = () => {
    setShowConfirmationModal(false);
    setDeleteDocId(null);
  };

  /**
   * Handles the deletion of a voicemail from the database.
   */
  const deleteVoicemail = async () => {
    if (!deleteDocId) {
      console.error("No document ID to delete.");
      return;
    }
    try {
      await deleteVoicemailFromDb(deleteDocId);
      console.log("Voicemail successfully deleted!");
      
      // Reload voicemails to update the list
      await loadVoicemails();
    } catch (error) {
      console.error("Error removing voicemail: ", error);
    } finally {
      cancelDelete(); // Always hide modal
    }
  };

  /**
   * Marks a voicemail as returned in the database.
   * @param {string} id - The document ID of the voicemail to mark as returned.
   */
  const markVoicemailAsReturned = async (id) => {
    try {
      await markVoicemailAsReturnedInDb(id);
      console.log("Voicemail marked as returned:", id);
      
      // Reload voicemails to update the list (returned voicemails will be filtered out)
      await loadVoicemails();
    } catch (error) {
      console.error("Error marking voicemail as returned: ", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voicemail tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="voicemail-form-container">
        <h1 className="form-title">Voicemail Message</h1>
        <form onSubmit={addVoicemail} className="space-y-4">
          <div className="form-group">
            <label htmlFor="fromName">From:</label>
            <input type="text" id="fromName" value={fromName} onChange={(e) => setFromName(e.target.value)} required className="rounded-md" />
          </div>
          <div className="form-group">
            <label htmlFor="toName">To:</label>
            <input type="text" id="toName" value={toName} onChange={(e) => setToName(e.target.value)} required className="rounded-md" />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="rounded-md" />
          </div>
          <div className="form-group">
            <label htmlFor="messageContent">Message:</label>
            <textarea id="messageContent" rows="4" value={messageContent} onChange={(e) => setMessageContent(e.target.value)} required className="rounded-md"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="dateTime">Date & Time:</label>
            <input type="datetime-local" id="dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required className="rounded-md" />
          </div>
          <div className="form-group">
            <label htmlFor="takenBy">Message Taken By:</label>
            <input type="text" id="takenBy" value={takenBy} onChange={(e) => setTakenBy(e.target.value)} required className="rounded-md" />
          </div>
          <button type="submit" className="btn-primary">Add Voicemail</button>
        </form>
      </div>

      <div className="voicemail-list-container">
        <h2 className="form-title text-2xl mb-4">Your Voicemails</h2>
        <div id="voicemailList" className="space-y-4">
          {voicemails.length === 0 ? (
            <p className="text-center text-gray-600">No voicemails to display.</p>
          ) : (
            voicemails.map((voicemail) => (
              <div key={voicemail.id} className="voicemail-card">
                <p><strong>From:</strong> {voicemail.fromName}</p>
                <p><strong>To:</strong> {voicemail.toName}</p>
                <p><strong>Phone:</strong> {voicemail.phoneNumber}</p>
                <p><strong>Message:</strong> {voicemail.messageContent}</p>
                <p><strong>Date/Time:</strong> {new Date(voicemail.dateTime).toLocaleString()}</p>
                <p><strong>Taken By:</strong> {voicemail.takenBy}</p>
                <div className="actions">
                  {!voicemail.returned && (
                    <button className="returned-btn" onClick={() => markVoicemailAsReturned(voicemail.id)}>Returned</button>
                  )}
                  <button className="delete-btn" onClick={() => confirmDelete(voicemail.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay visible">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this voicemail?</p>
            <div className="modal-buttons">
              <button id="confirmDeleteBtn" className="btn-confirm" onClick={deleteVoicemail}>Delete</button>
              <button id="cancelDeleteBtn" className="btn-cancel" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
