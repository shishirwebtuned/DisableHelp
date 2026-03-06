'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Utensils,
    Film,
    PawPrint,
    Trophy,
    Heart,
    Music,
    Camera,
    Plane,
    Gamepad2,
    PartyPopper,
    Book,
    Plus,
} from 'lucide-react';

interface AdditionalDetailsProps {
    onSave: (data: AdditionalDetailsData, navigate?: boolean) => void;
    currentView?: string;
    initialData?: AdditionalDetailsData;
}

export interface AdditionalDetailsData {
    languages: {
        firstLanguages: string[];
        secondLanguages: string[];
    };
    selectedInterests: string[];
    culturalInfo: {
        background: string[];
        religion: string[];
        smokingPolicy: string;
        petFriendly: string;
    };
    preferences: {
        preferredClientAge: string;
        preferredGender: string;
        willingToTravel: string;
        maxTravelDistance: string;
    };
    bankDetails: {
        accountName: string;
        bsb: string;
        accountNumber: string;
    };
    immunisation: {
        hasSeasonalFluShot: boolean;
        covidVaccineStatus: string;
        statusConfirmed: boolean;
    };
    lgbtqiaPlusFriendly: boolean;
    personality: string;
}

export default function AdditionalDetails({ onSave, currentView = 'languages', initialData }: AdditionalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);

    // Use a ref to track if we've already initialized from initialData
    const isInitialized = useRef(false);

    const [languages, setLanguages] = useState<AdditionalDetailsData['languages']>({
        firstLanguages: [],
        secondLanguages: []
    });
    const [newFirstLanguage, setNewFirstLanguage] = useState('');
    const [newSecondLanguage, setNewSecondLanguage] = useState('');

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const [culturalInfo, setCulturalInfo] = useState<{
        background: string[];
        religion: string[];
        smokingPolicy: string;
        petFriendly: string;
    }>({
        background: [],
        religion: [],
        smokingPolicy: 'non-smoker',
        petFriendly: 'yes',
    });
    const [newBackground, setNewBackground] = useState('');
    const [newReligion, setNewReligion] = useState('');

    const [preferences, setPreferences] = useState<{
        preferredClientAge: string;
        preferredGender: string;
        willingToTravel: string;
        maxTravelDistance: string;
    }>({
        preferredClientAge: 'No preference',
        preferredGender: 'No preference',
        willingToTravel: 'yes',
        maxTravelDistance: '20',
    });
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

    const [bankDetails, setBankDetails] = useState({
        accountName: '',
        bsb: '',
        accountNumber: '',
    });

    const [immunisation, setImmunisation] = useState({
        hasSeasonalFluShot: false,
        covidVaccineStatus: 'notVaccinated',
        statusConfirmed: false,
    });

    const [lgbtqiaPlusFriendly, setLgbtqiaPlusFriendly] = useState(false);
    const [personality, setPersonality] = useState('outgoing');

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        if (initialData) {
            setLanguages(prev => JSON.stringify(initialData.languages) === JSON.stringify(prev) ? prev : initialData.languages || prev);
            setSelectedInterests(prev => JSON.stringify(initialData.selectedInterests) === JSON.stringify(prev) ? prev : initialData.selectedInterests || prev);
            setCulturalInfo(prev => JSON.stringify(initialData.culturalInfo) === JSON.stringify(prev) ? prev : initialData.culturalInfo || prev);
            setPreferences(prev => JSON.stringify(initialData.preferences) === JSON.stringify(prev) ? prev : initialData.preferences || prev);
            setBankDetails(prev => JSON.stringify(initialData.bankDetails) === JSON.stringify(prev) ? prev : initialData.bankDetails || prev);
            setImmunisation(prev => JSON.stringify(initialData.immunisation) === JSON.stringify(prev) ? prev : initialData.immunisation || prev);
            setLgbtqiaPlusFriendly(prev => !!initialData.lgbtqiaPlusFriendly === prev ? prev : !!initialData.lgbtqiaPlusFriendly);
            setPersonality(prev => initialData.personality === prev ? prev : initialData.personality || prev);

            isInitialized.current = true;
        }
    }, [initialData]);

    const currentData = useMemo(() => ({
        languages,
        selectedInterests,
        culturalInfo,
        preferences,
        bankDetails,
        immunisation,
        lgbtqiaPlusFriendly,
        personality
    }), [languages, selectedInterests, culturalInfo, preferences, bankDetails, immunisation, lgbtqiaPlusFriendly, personality]);

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

    const handleSave = useCallback(() => {
        onSave(currentData, true);
    }, [currentData, onSave]);

    const handleSavePreferences = useCallback(() => {
        setIsPreferencesModalOpen(false);
        onSave(currentData, true);
    }, [currentData, onSave]);

    const interests = [
        { id: 'cooking', label: 'Cooking', icon: Utensils },
        { id: 'movies', label: 'Movies', icon: Film },
        { id: 'pets', label: 'Pets', icon: PawPrint },
        { id: 'sports', label: 'Sports', icon: Trophy },
        { id: 'gardening', label: 'Gardening', icon: Heart },
        { id: 'music', label: 'Music', icon: Music },
        { id: 'photography', label: 'Photography / Art', icon: Camera },
        { id: 'travel', label: 'Travel', icon: Plane },
        { id: 'indoor-games', label: 'Indoor Games / Puzzles', icon: Gamepad2 },
        { id: 'cultural', label: 'Cultural Festivities', icon: PartyPopper },
        { id: 'reading', label: 'Reading', icon: Book },
        { id: 'other', label: 'Other', icon: Plus },
    ];

    const toggleInterest = (id: string) => {
        setSelectedInterests((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const addFirstLanguage = () => {
        if (newFirstLanguage.trim()) {
            setLanguages(prev => ({ ...prev, firstLanguages: [...prev.firstLanguages, newFirstLanguage.trim()] }));
            setNewFirstLanguage('');
        }
    };

    const removeFirstLanguage = (lang: string) => {
        setLanguages(prev => ({ ...prev, firstLanguages: prev.firstLanguages.filter(l => l !== lang) }));
    };

    const addSecondLanguage = () => {
        if (newSecondLanguage.trim()) {
            setLanguages(prev => ({ ...prev, secondLanguages: [...prev.secondLanguages, newSecondLanguage.trim()] }));
            setNewSecondLanguage('');
        }
    };

    const removeSecondLanguage = (lang: string) => {
        setLanguages(prev => ({ ...prev, secondLanguages: prev.secondLanguages.filter(l => l !== lang) }));
    };

    const addBackground = () => {
        if (newBackground.trim()) {
            setCulturalInfo(prev => ({ ...prev, background: [...prev.background, newBackground.trim()] }));
            setNewBackground('');
        }
    };

    const removeBackground = (bg: string) => {
        setCulturalInfo(prev => ({ ...prev, background: prev.background.filter(b => b !== bg) }));
    };

    const addReligion = () => {
        if (newReligion.trim()) {
            setCulturalInfo(prev => ({ ...prev, religion: [...prev.religion, newReligion.trim()] }));
            setNewReligion('');
        }
    };

    const removeReligion = (rel: string) => {
        setCulturalInfo(prev => ({ ...prev, religion: prev.religion.filter(r => r !== rel) }));
    };

    const renderLanguages = () => (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold ">Languages</h2>
                <p className="text-muted-foreground">Languages you speak</p>
            </div>
            <Card className=' border-none '>
                <CardContent className=" space-y-2 p-0 ">
                    {/* First Languages */}
                    <div>
                        <Label className="mb-2 block">First Languages</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {languages.firstLanguages.map((lang) => (
                                <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                                    {lang}
                                    <button onClick={() => removeFirstLanguage(lang)} className="ml-2 hover:text-red-600">×</button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add first language..."
                                value={newFirstLanguage}
                                onChange={(e) => setNewFirstLanguage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addFirstLanguage()}
                            />
                            <Button onClick={addFirstLanguage}>Add</Button>
                        </div>
                    </div>

                    {/* Second Languages */}
                    <div>
                        <Label className="mb-2 block">Second Languages</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {languages.secondLanguages.map((lang) => (
                                <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                                    {lang}
                                    <button onClick={() => removeSecondLanguage(lang)} className="ml-2 hover:text-red-600">×</button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add second language..."
                                value={newSecondLanguage}
                                onChange={(e) => setNewSecondLanguage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSecondLanguage()}
                            />
                            <Button onClick={addSecondLanguage}>Add</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderInterests = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Interests & Hobbies</h2>
                <p className="text-muted-foreground">
                    Select the things that you enjoy doing. Clients are more likely to find Support Workers who share similar interests.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {interests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.id);

                    return (
                        <button
                            key={interest.id}
                            onClick={() => toggleInterest(interest.id)}
                            className={`
                                flex flex-col items-center p-6 rounded-lg border-2 transition-all
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-border dark:border-border hover:border-muted-foreground/30'
                                }
                            `}
                        >
                            <Icon className={`h-10 w-10 mb-3 ${isSelected ? 'text-blue-500' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium text-center text-foreground">{interest.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderCulturalBackground = () => (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold mb-2">Cultural Background & Preferences</h2>
                <p className="text-muted-foreground">Your cultural background and preferences</p>
            </div>
            <Card className=' border-none '>
                <CardContent className="pt-4 p-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="mb-2 block">Cultural Backgrounds</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {culturalInfo.background.map((bg) => (
                                    <Badge key={bg} variant="secondary" className="text-sm px-3 py-1">
                                        {bg}
                                        <button onClick={() => removeBackground(bg)} className="ml-2 hover:text-red-600">×</button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add background..."
                                    value={newBackground}
                                    onChange={(e) => setNewBackground(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addBackground()}
                                />
                                <Button onClick={addBackground} size="sm">Add</Button>
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Religions</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {culturalInfo.religion.map((rel) => (
                                    <Badge key={rel} variant="secondary" className="text-sm px-3 py-1">
                                        {rel}
                                        <button onClick={() => removeReligion(rel)} className="ml-2 hover:text-red-600">×</button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add religion..."
                                    value={newReligion}
                                    onChange={(e) => setNewReligion(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addReligion()}
                                />
                                <Button onClick={addReligion} size="sm">Add</Button>
                            </div>
                        </div>
                        <div>
                            <Label>Smoking Policy</Label>
                            <Select
                                value={culturalInfo.smokingPolicy}
                                onValueChange={(value) => setCulturalInfo({ ...culturalInfo, smokingPolicy: value })}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="non-smoker">Non-smoker</SelectItem>
                                    <SelectItem value="smoker">Smoker</SelectItem>
                                    <SelectItem value="occasional">Occasional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Pet Friendly</Label>
                            <Select
                                value={culturalInfo.petFriendly}
                                onValueChange={(value) => setCulturalInfo({ ...culturalInfo, petFriendly: value })}
                            >
                                <SelectTrigger className="mt-2 w-full ">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Personality Type</Label>
                            <Select
                                value={personality}
                                onValueChange={(value) => setPersonality(value)}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="Select personality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="outgoing">Outgoing</SelectItem>
                                    <SelectItem value="relaxed">Relaxed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                        <input
                            type="checkbox"
                            id="lgbtqia"
                            checked={lgbtqiaPlusFriendly}
                            onChange={(e) => setLgbtqiaPlusFriendly(e.target.checked)}
                            className="rounded border-border text-blue-600 focus:ring-blue-500 bg-background accent-blue-600"
                        />
                        <Label htmlFor="lgbtqia">I am LGBTQIA+ Friendly</Label>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderPreferences = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">My Preferences</h2>
                    <p className="text-muted-foreground">Your work preferences and requirements</p>
                </div>
                <Button onClick={() => setIsPreferencesModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Edit Preferences
                </Button>
            </div>
            <Card className=' p-0 border-none'>
                <CardContent className="pt-6 p-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Preferred Client Age</p>
                            <p className="font-medium text-foreground">{preferences.preferredClientAge}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Preferred Gender</p>
                            <p className="font-medium text-foreground">{preferences.preferredGender}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Willing to Travel</p>
                            <p className="font-medium text-foreground">{preferences.willingToTravel === 'yes' ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Max Travel Distance</p>
                            <p className="font-medium text-foreground">{preferences.maxTravelDistance} km</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderBankAccount = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Bank Account Details</h2>
                <p className="text-muted-foreground">For receiving payments</p>
            </div>
            <Card className=' border-none p-0'>
                <CardContent className="pt-2 p-0 space-y-4">
                    <div className="grid gap-4">
                        <div>
                            <Label>Account Name</Label>
                            <Input
                                placeholder="Account holder name"
                                value={bankDetails.accountName}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>BSB</Label>
                                <Input
                                    placeholder="XXX-XXX"
                                    value={bankDetails.bsb}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bsb: e.target.value })}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label>Account Number</Label>
                                <Input
                                    placeholder="XXXXXXXX"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save All Additional Details
                </Button>
            </div>
        </div>
    );

    const renderImmunisation = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Immunisation Status</h2>
                <p className="text-muted-foreground">Your vaccination status</p>
            </div>
            <Card className=' border-none p-0'>
                <CardContent className="pt-6 p-0 space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="fluShot"
                            checked={immunisation.hasSeasonalFluShot}
                            onChange={(e) => setImmunisation({ ...immunisation, hasSeasonalFluShot: e.target.checked })}
                            className="rounded border-border text-blue-600 focus:ring-blue-500 bg-background accent-blue-600"
                        />
                        <Label htmlFor="fluShot">I have a current seasonal flu shot</Label>
                    </div>
                    <div>
                        <Label>COVID-19 Vaccine Status</Label>
                        <Select
                            value={immunisation.covidVaccineStatus}
                            onValueChange={(value) => setImmunisation({ ...immunisation, covidVaccineStatus: value })}
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fullyVaccinated">Fully Vaccinated</SelectItem>
                                <SelectItem value="medicalCondition">Medical Condition</SelectItem>
                                <SelectItem value="remoteWorker">Remote Worker</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="statusConfirmed"
                            checked={immunisation.statusConfirmed}
                            onChange={(e) => setImmunisation({ ...immunisation, statusConfirmed: e.target.checked })}
                            className="rounded border-border text-blue-600 focus:ring-blue-500 bg-background accent-blue-600"
                        />
                        <Label htmlFor="statusConfirmed">I confirm this status is accurate</Label>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {currentSection === 'languages' && renderLanguages()}
            {currentSection === 'interests-hobbies' && renderInterests()}
            {currentSection === 'cultural-background' && renderCulturalBackground()}
            {currentSection === 'preferences' && renderPreferences()}
            {currentSection === 'bank-account' && renderBankAccount()}
            {currentSection === 'immunisation' && renderImmunisation()}

            {/* Preferences Modal */}
            <Dialog open={isPreferencesModalOpen} onOpenChange={setIsPreferencesModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Preferences</DialogTitle>
                        <DialogDescription>Update your work preferences</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Preferred Client Age</Label>
                            <Select
                                value={preferences.preferredClientAge}
                                onValueChange={(value) => setPreferences({ ...preferences, preferredClientAge: value })}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="No preference">No preference</SelectItem>
                                    <SelectItem value="Children (0-17)">Children (0-17)</SelectItem>
                                    <SelectItem value="Adults (18-64)">Adults (18-64)</SelectItem>
                                    <SelectItem value="Seniors (65+)">Seniors (65+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Preferred Gender</Label>
                            <Select
                                value={preferences.preferredGender}
                                onValueChange={(value) => setPreferences({ ...preferences, preferredGender: value })}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="No preference">No preference</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Willing to Travel</Label>
                            <Select
                                value={preferences.willingToTravel}
                                onValueChange={(value) => setPreferences({ ...preferences, willingToTravel: value })}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Max Travel Distance (km)</Label>
                            <Input
                                type="number"
                                value={preferences.maxTravelDistance}
                                onChange={(e) => setPreferences({ ...preferences, maxTravelDistance: e.target.value })}
                                className="mt-2 w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreferencesModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSavePreferences}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
