'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Clock, DollarSign, Briefcase, Shield, Heart, Check } from 'lucide-react';
import { Switch } from '../ui/switch';

interface JobDetailsProps {
    onSave: (data: JobDetailsData, navigate?: boolean) => void;
    currentView?: string;
    initialData?: JobDetailsData;
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
    freeMeetAndGreet: boolean;
}

export default function JobDetails({ onSave, currentView = 'preferred-hours', initialData }: JobDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);

    // Default fallback state
    const defaultPreferredHours = {
        Monday: { enabled: true, slots: ['6am-11am', '11am-2pm'] },
        Tuesday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Wednesday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Thursday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Friday: { enabled: true, slots: ['11am-2pm', '2pm-5pm'] },
        Saturday: { enabled: true, slots: ['6am-11am', '11am-2pm', '2pm-5pm'] },
        Sunday: { enabled: true, slots: ['6am-11am', '11am-2pm', '2pm-5pm'] },
    };

    const [preferredHours, setPreferredHours] = useState(defaultPreferredHours);

    const [rates, setRates] = useState({
        standard: 45,
        weekend: 55,
        evening: 50,
        overnight: 60,
    });

    const [freeMeetAndGreet, setFreeMeetAndGreet] = useState(true);
    const [selectedServices, setSelectedServices] = useState(['Personal Care', 'Community Access', 'Transport', 'Household Tasks', 'Social Support', 'Meal Preparation']);
    const [showAllTimes, setShowAllTimes] = useState(false);

    // Use a ref to track if we've already initialized from initialData
    const isInitialized = useRef(false);

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    // Update state when initialData provided
    useEffect(() => {
        if (initialData) {
            if (initialData.preferredHours && Object.keys(initialData.preferredHours).length > 0) {
                const mergedHours = { ...defaultPreferredHours, ...initialData.preferredHours };
                if (JSON.stringify(mergedHours) !== JSON.stringify(preferredHours)) {
                    setPreferredHours(mergedHours);
                }
            }
            if (initialData.rates && JSON.stringify(initialData.rates) !== JSON.stringify(rates)) {
                setRates(initialData.rates);
            }
            if (initialData.selectedServices && JSON.stringify(initialData.selectedServices) !== JSON.stringify(selectedServices)) {
                setSelectedServices(initialData.selectedServices);
            }
            if (initialData.freeMeetAndGreet !== undefined && initialData.freeMeetAndGreet !== freeMeetAndGreet) {
                setFreeMeetAndGreet(initialData.freeMeetAndGreet);
            }
            isInitialized.current = true;
        }
    }, [initialData]);

    const currentData = useMemo(() => ({
        preferredHours,
        rates,
        selectedServices,
        freeMeetAndGreet
    }), [preferredHours, rates, selectedServices, freeMeetAndGreet]);

    useEffect(() => {
        // Sync data to parent only if we have initialData and it's different
        if (initialData && isInitialized.current) {
            const initialStr = JSON.stringify(initialData);
            const currentStr = JSON.stringify(currentData);

            if (currentStr !== initialStr) {
                const timeoutId = setTimeout(() => {
                    onSave(currentData, false);
                }, 0);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [currentData, initialData, onSave]);

    const handleSave = () => {
        const data = { preferredHours, rates, selectedServices, freeMeetAndGreet };
        onSave(data, true);
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

    const toggleSelectAllForDay = (day: string) => {
        setPreferredHours(prev => {
            const dayData = prev[day as keyof typeof prev];
            const allSlots = ['12am-6am', '6am-11am', '11am-2pm', '2pm-5pm', '5pm-9pm', '9pm-12am'];
            const startAllSelected = allSlots.every(slot => dayData.slots.includes(slot));

            return {
                ...prev,
                [day]: {
                    ...dayData,
                    slots: startAllSelected ? [] : allSlots,
                    enabled: true // Enable day if selecting all
                }
            };
        });
    };

    const standardSlots = ['6am-11am', '11am-2pm', '2pm-5pm', '5pm-9pm'];
    const extendedSlots = ['12am-6am', '6am-11am', '11am-2pm', '2pm-5pm', '5pm-9pm', '9pm-12am'];
    const visibleSlots = showAllTimes ? extendedSlots : standardSlots;

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const renderPreferredHours = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Availability</h2>
                <p className="text-muted-foreground">
                    Select your preferred working hours. This helps us match you with the right clients and sessions.
                </p>
            </div>

            <Card className="border-none p-0">
                <CardContent className="pt-6 space-y-6 p-0">
                    {Object.keys(preferredHours).map((day) => {
                        const dayData = preferredHours[day as keyof typeof preferredHours];

                        return (
                            <div key={day} className="py-4 first:pt-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Day Tag & Toggle */}
                                    <div className="w-full md:w-48 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div
                                                onClick={() => toggleDayEnabled(day)}
                                                className={`
                                                relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                                transition-colors duration-200 ease-in-out focus:outline-none 
                                                ${dayData.enabled ? 'bg-[#8ac6dd]' : 'bg-muted'}
                                            `}
                                            >
                                                <span className={`
                                                pointer-events-none inline-block h-3 w-3 transform rounded-full ring-0 
                                                transition duration-200 ease-in-out
                                                ${dayData.enabled ? 'translate-x-4' : 'translate-x-0'}
                                                ${dayData.enabled ? 'bg-[#042a2d]' : 'bg-white'}
                                            `} />
                                            </div>
                                            <span className={`text-sm font-medium ${dayData.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {day}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Time slots */}
                                    <div className="flex-1">
                                        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 transition-opacity duration-300 ${!dayData.enabled ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                                            {visibleSlots.map((slot) => {
                                                const isSelected = dayData.enabled && dayData.slots.includes(slot);
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => toggleTimeSlot(day, slot)}
                                                        className={`
                                                        flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all border
                                                        ${isSelected
                                                                ? 'bg-[#8ac6dd]/20 border-[#8ac6dd]/50 text-[#042a2d]'
                                                                : 'bg-background border-border text-muted-foreground hover:bg-muted/50'
                                                            }
                                                    `}
                                                    >
                                                        {isSelected && <CheckCircle className="h-4 w-4 shrink-0" />}
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Sticky Footnote/Toggle */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#8ac6dd]" />
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Advanced View</h4>
                        <p className="text-xs text-muted-foreground">Show early morning and late night slots.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground/80">Show all slots</span>
                    <Switch
                        checked={showAllTimes}
                        onCheckedChange={setShowAllTimes}
                        className="data-[state=checked]:bg-[#8ac6dd] data-[state=unchecked]:bg-slate-300"
                    />

                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="">
                    Save Availability
                </Button>
            </div>
        </div>
    );

    const renderIndicativeRates = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Hourly Rates</h2>
                <p className="text-muted-foreground">
                    Set your indicative rates for different session types.
                </p>
            </div>

            <Card className="border-none p-0">
                <CardContent className="pt-6 p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Standard Weekday', key: 'standard', icon: Clock },
                            { label: 'Weekend Session', key: 'weekend', icon: Briefcase },
                            { label: 'Evening (After 6pm)', key: 'evening', icon: Clock },
                            { label: 'Overnight Stay', key: 'overnight', icon: Shield },
                        ].map((rate) => (
                            <div key={rate.key} className="space-y-1">
                                <Label className="text-xs text-foreground/80">{rate.label}</Label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-muted-foreground text-sm">$</span>
                                    </div>
                                    <Input
                                        type="number"
                                        value={rates[rate.key as keyof typeof rates]}
                                        onChange={(e) => setRates({ ...rates, [rate.key]: parseFloat(e.target.value) })}
                                        className="pl-7 text-sm"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground text-xs font-medium">
                                        / hr
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="bg-[#8ac6dd]/10 rounded-lg p-4 border border-[#8ac6dd]/20 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#8ac6dd] shrink-0" />
                <p className="text-sm text-[#042a2d]/80">
                    Higher rates typically apply for weekends and public holidays.
                </p>
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="">
                    Save Rates
                </Button>
            </div>
        </div>
    );

    const renderServicesOffered = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Services</h2>
                <p className="text-muted-foreground">
                    Select the services you are happy to provide.
                </p>
            </div>

            <Card className="border-none p-0">
                <CardContent className="pt-6  p-0 space-y-6">
                    <div
                        onClick={() => setFreeMeetAndGreet(!freeMeetAndGreet)}
                        className={`
                            flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer bg-background
                            ${freeMeetAndGreet ? 'border-[#8ac6dd] bg-[#8ac6dd]/10' : 'border-border'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <Heart className={`h-4 w-4 ${freeMeetAndGreet ? 'text-[#8ac6dd] fill-[#8ac6dd]' : 'text-muted-foreground'}`} />
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">Free Meet & Greet</h4>
                                <p className="text-xs text-muted-foreground">Initial meeting at no cost.</p>
                            </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${freeMeetAndGreet ? 'bg-[#8ac6dd] border-[#8ac6dd]' : 'border-border'}`}>
                            {freeMeetAndGreet && <Check className="h-2.5 w-2.5 text-[#042a2d] stroke-[3px]" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['Personal Care', 'Community Access', 'Transport', 'Household Tasks', 'Social Support', 'Meal Preparation', 'Medication Management', 'Exercise & Mobility'].map((service) => (
                            <div
                                key={service}
                                onClick={() => toggleService(service)}
                                className={`
                                    flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer
                                    ${selectedServices.includes(service)
                                        ? 'bg-[#8ac6dd]/10 border-[#8ac6dd]/50'
                                        : 'bg-background border-border hover:bg-muted/50'
                                    }
                                `}
                            >
                                <span className={`text-sm font-medium transition-colors ${selectedServices.includes(service) ? 'text-[#042a2d]' : 'text-foreground/80'}`}>{service}</span>
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${selectedServices.includes(service) ? 'bg-[#8ac6dd] border-[#8ac6dd]' : 'border-border'}`}>
                                    {selectedServices.includes(service) && <Check className="h-2.5 w-2.5 text-[#042a2d] stroke-[3px]" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="">
                    Save Services
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
