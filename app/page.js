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
import { formatPhoneNumber, unformatPhoneNumber } from './utils/phoneFormatter';

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
      // Store the unformatted phone number in the database
      const unformattedPhone = unformatPhoneNumber(phoneNumber);

      await addVoicemailToDb({
        fromName,
        toName,
        phoneNumber: unformattedPhone,
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
    <div className="min-h-screen bg-gray-100 flex justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl h-fit">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Voicemail Message</h1>

        <form onSubmit={addVoicemail} className="space-y-4">
          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">From:</label>
            <input
              type="text"
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toName" className="block text-sm font-medium text-gray-700 mb-1">To:</label>
            <input
              type="text"
              id="toName"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="(555) 123-4567"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
            <textarea
              id="messageContent"
              rows="4"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">Date & Time:</label>
            <input
              type="datetime-local"
              id="dateTime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="takenBy" className="block text-sm font-medium text-gray-700 mb-1">Message Taken By:</label>
            <input
              type="text"
              id="takenBy"
              value={takenBy}
              onChange={(e) => setTakenBy(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out shadow-md"
          >
            Add Voicemail
          </button>
        </form>

        {/* Display of Voicemails */}
        {voicemails.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Voicemails</h2>
            <div className="overflow-x-auto rounded-lg shadow-md">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taken By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voicemails.map((voicemail) => (
                      <tr key={voicemail.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{voicemail.fromName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{voicemail.toName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPhoneNumber(voicemail.phoneNumber)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{voicemail.messageContent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(voicemail.dateTime).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{voicemail.takenBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            {!voicemail.returned && (
                              <button
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition duration-150 ease-in-out"
                                onClick={() => markVoicemailAsReturned(voicemail.id)}
                              >
                                Returned
                              </button>
                            )}
                            <button
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition duration-150 ease-in-out"
                              onClick={() => confirmDelete(voicemail.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {voicemails.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">No voicemails to display.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this voicemail?</p>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  onClick={deleteVoicemail}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
