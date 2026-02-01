'use client';

import { useState, useEffect } from 'react';
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
    onSave: (data: AdditionalDetailsData) => void;
    currentView?: string;
}

export interface AdditionalDetailsData {
    languages: string[];
    selectedInterests: string[];
    culturalInfo: {
        background: string;
        religion: string;
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
}

export default function AdditionalDetails({ onSave, currentView = 'languages' }: AdditionalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);
    const [languages, setLanguages] = useState(['English (Native)', 'Spanish (Conversational)', 'Auslan (Basic)']);
    const [newLanguage, setNewLanguage] = useState('');

    const [selectedInterests, setSelectedInterests] = useState<string[]>(['cooking', 'movies', 'pets']);

    const [culturalInfo, setCulturalInfo] = useState({
        background: 'Australian',
        religion: 'No preference',
        smokingPolicy: 'non-smoker',
        petFriendly: 'yes',
    });

    const [preferences, setPreferences] = useState({
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

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        const data = { languages, selectedInterests, culturalInfo, preferences, bankDetails };
        console.log('AdditionalDetails Data:', data);
    }, [languages, selectedInterests, culturalInfo, preferences, bankDetails]);

    const handleSave = () => {
        const data = { languages, selectedInterests, culturalInfo, preferences, bankDetails };
        console.log('Saving Additional Details:', data);
        onSave(data);
    };

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

    const addLanguage = () => {
        if (newLanguage.trim()) {
            setLanguages([...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const removeLanguage = (lang: string) => {
        setLanguages(languages.filter(l => l !== lang));
    };

    const renderLanguages = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Languages</h2>
                <p className="text-muted-foreground">Languages you speak</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                                {lang}
                                <button 
                                    onClick={() => removeLanguage(lang)}
                                    className="ml-2 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Add language..." 
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                        />
                        <Button onClick={addLanguage}>Add</Button>
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
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <Icon className={`h-10 w-10 mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className="text-sm font-medium text-center">{interest.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderCulturalBackground = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Cultural Background & Preferences</h2>
                <p className="text-muted-foreground">Your cultural background and preferences</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Cultural Background</Label>
                            <Input 
                                value={culturalInfo.background}
                                onChange={(e) => setCulturalInfo({...culturalInfo, background: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Religion</Label>
                            <Input 
                                value={culturalInfo.religion}
                                onChange={(e) => setCulturalInfo({...culturalInfo, religion: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Smoking Policy</Label>
                            <Select 
                                value={culturalInfo.smokingPolicy}
                                onValueChange={(value) => setCulturalInfo({...culturalInfo, smokingPolicy: value})}
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
                                onValueChange={(value) => setCulturalInfo({...culturalInfo, petFriendly: value})}
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
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Preferred Client Age</p>
                            <p className="font-medium">{preferences.preferredClientAge}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Preferred Gender</p>
                            <p className="font-medium">{preferences.preferredGender}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Willing to Travel</p>
                            <p className="font-medium">{preferences.willingToTravel === 'yes' ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Max Travel Distance</p>
                            <p className="font-medium">{preferences.maxTravelDistance} km</p>
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

    const renderBankAccount = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Bank Account Details</h2>
                <p className="text-muted-foreground">For receiving payments</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4">
                        <div>
                            <Label>Account Name</Label>
                            <Input 
                                placeholder="Account holder name" 
                                value={bankDetails.accountName}
                                onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>BSB</Label>
                                <Input 
                                    placeholder="XXX-XXX" 
                                    value={bankDetails.bsb}
                                    onChange={(e) => setBankDetails({...bankDetails, bsb: e.target.value})}
                                    className="mt-2" 
                                />
                            </div>
                            <div>
                                <Label>Account Number</Label>
                                <Input 
                                    placeholder="XXXXXXXX" 
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                    className="mt-2" 
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save All Additional Details
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
                                onValueChange={(value) => setPreferences({...preferences, preferredClientAge: value})}
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
                                onValueChange={(value) => setPreferences({...preferences, preferredGender: value})}
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
                                onValueChange={(value) => setPreferences({...preferences, willingToTravel: value})}
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
                                onChange={(e) => setPreferences({...preferences, maxTravelDistance: e.target.value})}
                                className="mt-2 w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreferencesModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsPreferencesModalOpen(false)}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
