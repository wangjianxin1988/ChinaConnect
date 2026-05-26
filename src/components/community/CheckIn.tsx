/**
 * Check-In Component for ChinaConnect
 * Allows users to check-in at places and earn points
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { POINTS } from "@/types/database";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";

type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];

interface CheckInProps {
  userId: string;
  onCheckInSuccess?: (checkIn: CheckIn, pointsEarned: number) => void;
  className?: string;
}

interface CheckInFormData {
  placeName: string;
  placeId: string;
  city: string;
  location: { lat: number; lng: number } | null;
}

export function CheckInForm({ userId, onCheckInSuccess, className = "" }: CheckInProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckInFormData>({
    placeName: "",
    placeId: "",
    city: "",
    location: null,
  });

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
      );
    });
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFormData((prev) => ({ ...prev, location }));
      setError(null);
    } catch (err) {
      setError("Could not get current location. Please enter manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("check_ins")
        .insert({
          user_id: userId,
          place_id: formData.placeId || crypto.randomUUID(),
          place_name: formData.placeName,
          city: formData.city,
          location: formData.location,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update user points
      await supabase.rpc("add_points", {
        p_user_id: userId,
        p_points: POINTS.CHECK_IN,
        p_reason: `Check-in at ${formData.placeName}`,
      });

      onCheckInSuccess?.(data as CheckIn, POINTS.CHECK_IN);
      setIsOpen(false);
      setFormData({
        placeName: "",
        placeId: "",
        city: "",
        location: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>📍 Check In</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Place Name *</label>
            <Input
              type="text"
              value={formData.placeName}
              onChange={(e) => setFormData((prev) => ({ ...prev, placeName: e.target.value }))}
              placeholder="e.g., The Bund, Shanghai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Place ID (optional)</label>
            <Input
              type="text"
              value={formData.placeId}
              onChange={(e) => setFormData((prev) => ({ ...prev, placeId: e.target.value }))}
              placeholder="Google Places ID or similar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g., Shanghai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={
                  formData.location ? `${formData.location.lat}, ${formData.location.lng}` : ""
                }
                placeholder="Click to use current location"
                readOnly
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
                📍 Get Location
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-500">
              Earn <span className="text-green-600 font-semibold">+{POINTS.CHECK_IN} points</span>
            </span>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Checking in..." : "Check In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Recent Check-ins List Component
interface RecentCheckInsProps {
  checkIns: CheckIn[];
  className?: string;
}

export function RecentCheckIns({ checkIns, className = "" }: RecentCheckInsProps) {
  if (checkIns.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <span className="text-4xl mb-2 block">📍</span>
        <p>No check-ins yet</p>
        <p className="text-sm">Start exploring and check in to earn points!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {checkIns.map((checkIn) => (
        <div
          key={checkIn.id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <span className="text-2xl">📍</span>
          <div className="flex-1">
            <div className="font-medium">{checkIn.place_name}</div>
            <div className="text-sm text-gray-500">{checkIn.city}</div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(checkIn.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Check-in Stats Component
interface CheckInStatsProps {
  userId: string;
  className?: string;
}

export function CheckInStats({ userId, className = "" }: CheckInStatsProps) {
  const [stats, setStats] = useState<{ total: number; cities: number; places: number }>({
    total: 0,
    cities: 0,
    places: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from("check_ins")
          .select("city, place_name")
          .eq("user_id", userId);

        if (data) {
          const cities = new Set(data.map((c) => c.city));
          const places = new Set(data.map((c) => c.place_name));
          setStats({
            total: data.length,
            cities: cities.size,
            places: places.size,
          });
        }
      } catch (err) {
        console.error("Failed to fetch check-in stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  });

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-3xl font-bold">{stats.total}</div>
        <div className="text-sm text-gray-500">Total Check-ins</div>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-3xl font-bold">{stats.cities}</div>
        <div className="text-sm text-gray-500">Cities</div>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-3xl font-bold">{stats.places}</div>
        <div className="text-sm text-gray-500">Places</div>
      </div>
    </div>
  );
}

export default CheckInForm;
