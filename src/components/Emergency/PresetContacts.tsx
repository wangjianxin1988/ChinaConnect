import type { PresetContact } from "@/hooks/useEmergency";
import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface PresetContactsProps {
  contacts: PresetContact[];
  onAdd: (contact: PresetContact) => void;
  onRemove: (id: string) => void;
  onCall?: (phone: string) => void;
  className?: string;
}

const RELATIONSHIPS = [
  "Family",
  "Spouse",
  "Parent",
  "Friend",
  "Colleague",
  "Hotel",
  "Tour Guide",
  "Other",
];

export function PresetContacts({
  contacts,
  onAdd,
  onRemove,
  onCall,
  className = "",
}: PresetContactsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "Family",
  });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newContact.name.trim()) {
      setError("Please enter a name");
      return;
    }
    if (!newContact.phone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    const contact: PresetContact = {
      id: uuidv4(),
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship,
      isPrimary: contacts.length === 0,
    };

    onAdd(contact);
    setNewContact({ name: "", phone: "", relationship: "Family" });
    setShowAddForm(false);
    setError(null);
  }, [newContact, contacts.length, onAdd]);

  const handleCall = useCallback(
    (phone: string) => {
      if (onCall) {
        onCall(phone);
      } else {
        window.location.href = `tel:${phone}`;
      }
    },
    [onCall],
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>👥</span> Emergency Contacts
            </h2>
            <p className="text-sm opacity-90 mt-1">Save your emergency contacts here</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-slate-50 border-b">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Contact name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              onClick={handleAdd}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Contact
            </button>
          </div>
        </div>
      )}

      {/* Contact List */}
      <div className="max-h-[300px] overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-2 block">👥</span>
            <p>No emergency contacts saved</p>
            <p className="text-sm mt-1">Tap "+ Add" to save important contacts</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{contact.relationship}</div>
                  <div className="text-sm text-gray-600 font-mono">{contact.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCall(contact.phone)}
                    className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
                    aria-label={`Call ${contact.name}`}
                  >
                    📞
                  </button>
                  <button
                    onClick={() => onRemove(contact.id)}
                    className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                    aria-label={`Remove ${contact.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border-t border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
        <span>💡</span>
        <span>Add your hotel or tour guide for quick access during emergencies.</span>
      </div>
    </div>
  );
}

export default PresetContacts;
