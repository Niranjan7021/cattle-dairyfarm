/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cow, MilkRecord, NotificationAlert, User } from './types';
import { buildInitialCows, INITIAL_MILK_RECORDS, INITIAL_NOTIFICATIONS, INITIAL_USERS } from './data/initialData';
import { calculateRiskScoring } from './utils/scoring';
import { playNotificationChime } from './utils/audio';

import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CheckTodayQueue } from './components/CheckTodayQueue';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { MilkTracker } from './components/MilkTracker';
import { HerdDirectory } from './components/HerdDirectory';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { CowRegisterModal } from './components/CowRegisterModal';
import { CowDetailModal } from './components/CowDetailModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SMSAlertToast } from './components/SMSAlertToast';
import { sendActualSMS } from './utils/smsService';

import { subscribeToAuth, testFirestoreConnection } from './lib/firebase';

export default function App() {
  // Current user (defaults to null so user lands on Login/Register page first)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('herdsentinel_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Current tab (includes 'login' page tab)
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'check-today' | 'video-analyzer' | 'milk-tracker' | 'cows' | 'login'>(() => {
    const saved = localStorage.getItem('herdsentinel_user');
    return saved ? 'dashboard' : 'login';
  });

  // Cows dataset
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem('herdsentinel_cows');
    return saved ? JSON.parse(saved) : buildInitialCows();
  });

  // Milk records dataset
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>(() => {
    const saved = localStorage.getItem('herdsentinel_milk_records');
    return saved ? JSON.parse(saved) : INITIAL_MILK_RECORDS;
  });

  // Notifications dataset
  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('herdsentinel_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterCowOpen, setIsRegisterCowOpen] = useState(false);
  const [selectedCowForDetail, setSelectedCowForDetail] = useState<Cow | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeSmsToast, setActiveSmsToast] = useState<NotificationAlert | null>(null);

  // Pre-selected cow for Video Analyzer
  const [videoTargetTag, setVideoTargetTag] = useState<string>('0412');

  // Verify Firestore connection and listen for Firebase Auth state changes
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToAuth((fbUser) => {
      if (fbUser) {
        const loggedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Dairy Farmer',
          phone: fbUser.email || '+91 9876543210',
          organization: 'Firebase Authenticated Farm',
          role: 'farmer',
        };
        setCurrentUser(loggedUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('herdsentinel_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('herdsentinel_cows', JSON.stringify(cows));
  }, [cows]);

  useEffect(() => {
    localStorage.setItem('herdsentinel_milk_records', JSON.stringify(milkRecords));
  }, [milkRecords]);

  useEffect(() => {
    localStorage.setItem('herdsentinel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle adding new milk record (Feature 4 & 5)
  const handleAddMilkRecord = (
    newRecData: Omit<MilkRecord, 'id' | 'timestamp' | 'varianceFromBaselinePercent'>
  ) => {
    const cow = cows.find((c) => c.id === newRecData.cowId || c.tagNumber === newRecData.tagNumber);
    const baselineYield = cow ? cow.baseline.milkYieldMean : 30;
    const variance = baselineYield > 0
      ? Number((((newRecData.yieldLiters - baselineYield) / baselineYield) * 100).toFixed(1))
      : 0;

    const newRecord: MilkRecord = {
      ...newRecData,
      id: `milk-${Date.now()}`,
      timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      varianceFromBaselinePercent: variance,
    };

    setMilkRecords([newRecord, ...milkRecords]);

    // Update cow's today milk yield & scoring
    if (cow) {
      const updatedToday = {
        ...cow.today,
        milkYield: newRecData.yieldLiters,
      };
      const updatedScoring = calculateRiskScoring(cow.baseline, updatedToday);

      setCows((prev) =>
        prev.map((c) =>
          c.id === cow.id
            ? {
                ...c,
                today: updatedToday,
                scoring: updatedScoring,
              }
            : c
        )
      );
    }

    // Feature 5: Send notification to the farmer based on mobile no after the production of milk updation
    if (newRecData.smsSent) {
      const recipientPhone = newRecData.smsRecipientPhone || currentUser?.phone || '+1 (555) 382-9014';
      const isUrgent = variance < -15;

      const newAlert: NotificationAlert = {
        id: `notif-${Date.now()}`,
        type: 'milk_logged',
        recipientPhone,
        recipientName: currentUser?.name || 'Dairy Operator',
        cowTag: newRecData.tagNumber,
        title: `Milk Production Logged: Cow #${newRecData.tagNumber} (${newRecData.session})`,
        message: `Session milk: ${newRecData.yieldLiters}L (baseline expected: ${baselineYield}L, variance: ${variance > 0 ? '+' : ''}${variance}%). Updated in farm database.`,
        timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'delivered',
        priority: isUrgent ? 'high' : 'normal',
        read: false,
      };

      setNotifications([newAlert, ...notifications]);
      setActiveSmsToast(newAlert);
      playNotificationChime(isUrgent ? 'urgent' : 'sms');
    }
  };

  // Trigger SMS Alert when a cow is affected (sent directly to the owner's mobile number)
  const handleSendManualSmsAlert = (cow: Cow, customReason?: string) => {
    const recipientPhone = currentUser?.phone || '+91 9876543210';
    const recipientName = currentUser?.name || 'Dairy Farm Owner';
    const reasonText = customReason ? ` Observation: ${customReason}.` : '';

    const alertMessage = `Cow #${cow.tagNumber} (${cow.name}) is affected! Rumination: ${cow.scoring.ruminationVariancePercent}%, Feed: ${cow.scoring.feedVariancePercent}%. Risk Score: ${cow.scoring.combinedRiskIndex}/100. Action: ${cow.scoring.suggestedAction}.${reasonText}`;

    const newAlert: NotificationAlert = {
      id: `notif-${Date.now()}`,
      type: 'early_warning',
      recipientPhone,
      recipientName,
      cowTag: cow.tagNumber,
      title: `Affected Cow Alert: #${cow.tagNumber} (${cow.name})`,
      message: `[HERDSENTINEL SMS TO OWNER ${recipientPhone}] ${alertMessage}`,
      timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'delivered',
      priority: cow.scoring.priority,
      read: false,
    };

    setNotifications((prev) => [newAlert, ...prev]);
    setActiveSmsToast(newAlert);
    playNotificationChime('urgent');

    // Trigger actual backend/device SMS dispatch
    sendActualSMS({
      recipientPhone,
      recipientName,
      message: alertMessage,
      cowTag: cow.tagNumber,
    });
  };

  // Dispatch SMS for all affected cows to owner's mobile
  const handleSendSmsAlertToAll = (affectedCows: Cow[]) => {
    const recipientPhone = currentUser?.phone || '+91 9876543210';
    const recipientName = currentUser?.name || 'Dairy Farm Owner';

    const newAlerts: NotificationAlert[] = affectedCows.map((cow, idx) => {
      const alertMsg = `Cow #${cow.tagNumber} (${cow.name}) is affected. Rumination: ${cow.scoring.ruminationVariancePercent}% · Feed intake: ${cow.scoring.feedVariancePercent}%. Risk Score: ${cow.scoring.combinedRiskIndex}/100. Action: ${cow.scoring.suggestedAction}.`;
      
      // Dispatch actual SMS
      sendActualSMS({
        recipientPhone,
        recipientName,
        message: alertMsg,
        cowTag: cow.tagNumber,
      });

      return {
        id: `notif-${Date.now()}-${idx}`,
        type: 'early_warning',
        recipientPhone,
        recipientName,
        cowTag: cow.tagNumber,
        title: `Affected Cow Alert: #${cow.tagNumber} (${cow.name})`,
        message: `[HERDSENTINEL SMS TO OWNER ${recipientPhone}] ${alertMsg}`,
        timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'delivered',
        priority: cow.scoring.priority,
        read: false,
      };
    });

    setNotifications((prev) => [...newAlerts, ...prev]);
    if (newAlerts.length > 0) {
      setActiveSmsToast(newAlerts[0]);
    }
    playNotificationChime('urgent');
  };

  // Handle applying AI Video results to cow record (Feature 3)
  const handleApplyVideoResults = (
    tagNumber: string,
    analysis: {
      feedingMinutes: number;
      ruminationMinutes: number;
      chewRate: number;
      state: 'moving' | 'resting' | 'feeding';
    }
  ) => {
    setCows((prev) =>
      prev.map((c) => {
        if (c.tagNumber === tagNumber) {
          const updatedToday = {
            ...c.today,
            feedingTime: Math.max(c.today.feedingTime, analysis.feedingMinutes),
            ruminationTime: Math.max(c.today.ruminationTime, analysis.ruminationMinutes),
            jawChewRate: analysis.chewRate,
            movementState: analysis.state,
            lastVideoAnalyzedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          };
          const updatedScoring = calculateRiskScoring(c.baseline, updatedToday);
          return {
            ...c,
            today: updatedToday,
            scoring: updatedScoring,
          };
        }
        return c;
      })
    );

    // Also dispatch notification
    const recipientPhone = currentUser?.phone || '+1 (555) 382-9014';
    const newAlert: NotificationAlert = {
      id: `notif-${Date.now()}`,
      type: 'video_analyzed',
      recipientPhone,
      recipientName: currentUser?.name || 'Dairy Manager',
      cowTag: tagNumber,
      title: `AI Video Analysis Synchronized: Cow #${tagNumber}`,
      message: `Overhead CCTV pipeline recorded ${analysis.ruminationMinutes}m rumination and ${analysis.feedingMinutes}m bunk intake. Jaw chewing rate: ${analysis.chewRate} chews/min.`,
      timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'delivered',
      priority: 'normal',
      read: false,
    };

    setNotifications([newAlert, ...notifications]);
    setActiveSmsToast(newAlert);
    playNotificationChime('sms');
  };

  // Register new cow
  const handleRegisterCow = (newCow: Cow) => {
    setCows([newCow, ...cows]);
  };

  // If user selected login tab OR no user is logged in, show dedicated Login / Register Page
  if (currentTab === 'login' || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors">
        <Navigation
          currentTab="login"
          setCurrentTab={setCurrentTab}
          currentUser={currentUser}
          unreadCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenRegisterCow={() => setIsRegisterCowOpen(true)}
          onOpenAuth={() => setCurrentTab('login')}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentTab('login');
          }}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <AuthPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentTab('dashboard');
            }}
          />
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors">
      {/* Top Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRegisterCow={() => setIsRegisterCowOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            cows={cows}
            milkRecords={milkRecords}
            ownerPhone={currentUser.phone}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onSelectCowForDetail={(cow) => setSelectedCowForDetail(cow)}
            onSendSmsAlert={handleSendManualSmsAlert}
            onSendSmsAlertToAll={handleSendSmsAlertToAll}
            onOpenVideoAnalyzer={(tag) => {
              setVideoTargetTag(tag);
              setCurrentTab('video-analyzer');
            }}
          />
        )}

        {currentTab === 'check-today' && (
          <CheckTodayQueue
            cows={cows}
            ownerPhone={currentUser.phone}
            onSelectCowForChart={(cow) => setSelectedCowForDetail(cow)}
            onOpenVideoAnalyzer={(tag) => {
              setVideoTargetTag(tag);
              setCurrentTab('video-analyzer');
            }}
            onSendSmsAlert={handleSendManualSmsAlert}
            onSendSmsAlertToAll={handleSendSmsAlertToAll}
            onSelectCowForDetail={(cow) => setSelectedCowForDetail(cow)}
          />
        )}

        {currentTab === 'video-analyzer' && (
          <VideoAnalyzer
            cows={cows}
            initialSelectedTag={videoTargetTag}
            onApplyResultsToCow={handleApplyVideoResults}
            onSendSmsToOwner={(cow, reason) => handleSendManualSmsAlert(cow, reason)}
          />
        )}

        {currentTab === 'milk-tracker' && (
          <MilkTracker
            cows={cows}
            milkRecords={milkRecords}
            currentUser={currentUser}
            onAddMilkRecord={handleAddMilkRecord}
          />
        )}

        {currentTab === 'cows' && (
          <HerdDirectory
            cows={cows}
            onSelectCow={(cow) => setSelectedCowForDetail(cow)}
            onOpenRegisterModal={() => setIsRegisterCowOpen(true)}
            onOpenVideoAnalyzer={(tag) => {
              setVideoTargetTag(tag);
              setCurrentTab('video-analyzer');
            }}
            onSendSms={handleSendManualSmsAlert}
          />
        )}
      </main>

      {/* Floating SMS Notification Toast */}
      <SMSAlertToast
        notification={activeSmsToast}
        onClose={() => setActiveSmsToast(null)}
        onViewCow={(tag) => {
          const cow = cows.find((c) => c.tagNumber === tag);
          if (cow) setSelectedCowForDetail(cow);
        }}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onSelectCow={(tag) => {
          const cow = cows.find((c) => c.tagNumber === tag);
          if (cow) setSelectedCowForDetail(cow);
        }}
      />

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Register Cow Modal */}
      <CowRegisterModal
        isOpen={isRegisterCowOpen}
        onClose={() => setIsRegisterCowOpen(false)}
        onRegisterCow={handleRegisterCow}
      />

      {/* Cow Detail & 14-Day Baseline Modal */}
      <CowDetailModal
        cow={selectedCowForDetail}
        isOpen={!!selectedCowForDetail}
        onClose={() => setSelectedCowForDetail(null)}
        onSendSms={handleSendManualSmsAlert}
        onOpenVideoAnalyzer={(tag) => {
          setSelectedCowForDetail(null);
          setVideoTargetTag(tag);
          setCurrentTab('video-analyzer');
        }}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-neutral-200 dark:border-[#1d2b23] bg-white dark:bg-[#0c120f] text-xs text-neutral-600 dark:text-neutral-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-400">HerdSentinel</span>
            <span>·</span>
            <span>ONSPOT Computer Vision & Deep Learning Early-Warning Tool</span>
          </div>
          <div>
            Reports deviations from individual cow normal. Does not diagnose disease.
          </div>
        </div>
      </footer>
    </div>
  );
}
