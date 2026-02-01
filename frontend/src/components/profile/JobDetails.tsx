'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { DollarSign, Clock } from 'lucide-react';

interface JobDetailsProps {
    onSave: (data: JobDetailsData) => void;
    currentView?: string;
}

export interface JobDetailsData {
    preferredHours: {
        [key: string]: {
            enabled: boolean;
            slots: string[];
        };
    };
    rates: {
        standard: number;
        weekend: number;
        evening: number;
        overnight: number;
    };
    selectedServices: string[];
}

export default function JobDetails({ onSave, currentView = 'preferred-hours' }: JobDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);

    const [preferredHours, setPreferredHours] = useState({
        Monday: { enabled: true, slots: ['6am-11am', '11am-2pm'] },
        Tuesday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Wednesday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Thursday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Friday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Saturday: { enabled: true, slots: ['6am-11am', '11am-2pm', '2pm-5pm'] },
        Sunday: { enabled: true, slots: ['6am-11am', '11am-2pm', '2pm-5pm'] },
    });

    const [rates, setRates] = useState({
        standard: 45,
        weekend: 55,
        evening: 50,
        overnight: 60,
    });

    const [selectedServices, setSelectedServices] = useState(['Personal Care', 'Community Access', 'Transport', 'Household Tasks', 'Social Support', 'Meal Preparation']);

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        const data = { preferredHours, rates, selectedServices };
        console.log('JobDetails Data:', data);
    }, [preferredHours, rates, selectedServices]);

    const handleSave = () => {
        const data = { preferredHours, rates, selectedServices };
        console.log('Saving Job Details:', data);
        onSave(data);
    };

    const toggleTimeSlot = (day: string, slot: string) => {
        setPreferredHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day as keyof typeof prev],
                slots: prev[day as keyof typeof prev].slots.includes(slot)
                    ? prev[day as keyof typeof prev].slots.filter(s => s !== slot)
                    : [...prev[day as keyof typeof prev].slots, slot]
            }
        }));
    };

    const toggleDayEnabled = (day: string) => {
        setPreferredHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day as keyof typeof prev],
                enabled: !prev[day as keyof typeof prev].enabled
            }
        }));
    };

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const timeSlots = ['6am-11am', '11am-2pm', '2pm-5pm', '5pm-9pm'];

    const renderPreferredHours = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Preferred hours</h2>
                <p className="text-muted-foreground mb-1">Help us find you the best matched jobs.</p>
                <p className="text-sm text-muted-foreground">
                    Select one or more time slots for your preferred hours. Sessions can span across multiple time slots without needing to fill each slot entirely.
                </p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {Object.keys(preferredHours).map((day) => {
                        const dayData = preferredHours[day as keyof typeof preferredHours];
                        return (
                            <div key={day} className="border-b pb-4 last:border-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={dayData.enabled}
                                        onChange={() => toggleDayEnabled(day)}
                                        className="w-5 h-5 rounded text-purple-600"
                                    />
                                    <Label className="font-semibold text-base cursor-pointer" onClick={() => toggleDayEnabled(day)}>
                                        {day}
                                    </Label>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-8">
                                    {timeSlots.map((slot) => {
                                        const isSelected = dayData.slots.includes(slot);
                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => toggleTimeSlot(day, slot)}
                                                disabled={!dayData.enabled}
                                                className={`
                                                    px-4 py-2 rounded-md text-sm font-medium transition-all
                                                    ${isSelected 
                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                                                        : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                    ${!dayData.enabled && 'opacity-50 cursor-not-allowed'}
                                                `}
                                            >
                                                {isSelected && <CheckCircle className="inline h-3 w-3 mr-1" />}
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-muted-foreground">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderIndicativeRates = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Indicative Rates</h2>
                <p className="text-muted-foreground">Set your hourly rates for different services</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4">
                        <div>
                            <Label>Standard Hourly Rate</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    value={rates.standard}
                                    onChange={(e) => setRates({...rates, standard: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Weekend Rate</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    value={rates.weekend}
                                    onChange={(e) => setRates({...rates, weekend: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Evening Rate (After 6pm)</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    value={rates.evening}
                                    onChange={(e) => setRates({...rates, evening: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Overnight Rate</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    value={rates.overnight}
                                    onChange={(e) => setRates({...rates, overnight: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderServicesOffered = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Services Offered</h2>
                <p className="text-muted-foreground">Select the services you provide</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-3">
                        {['Personal Care', 'Community Access', 'Transport', 'Household Tasks', 'Social Support', 'Meal Preparation', 'Medication Management', 'Exercise & Mobility'].map((service) => (
                            <label key={service} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={selectedServices.includes(service)}
                                    onChange={() => toggleService(service)}
                                    className="rounded" 
                                />
                                <span className="text-sm">{service}</span>
                            </label>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            {currentSection === 'preferred-hours' && renderPreferredHours()}
            {currentSection === 'indicative-rates' && renderIndicativeRates()}
            {currentSection === 'services' && renderServicesOffered()}
        </div>
    );
}
