"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Check } from "lucide-react"
import { 
  COMMON_SKILLS, 
  HUMAN_LANGUAGES, 
  EXPERIENCE_LEVELS, 
  INTEREST_CATEGORIES,
  PROJECT_PREFERENCES 
} from "@/lib/constants"

interface OnboardingFormProps {
  initialData?: Partial<{
    name: string
    gender: string
    age: string
    educationLevel: string
    country: string
    city: string
    occupation: string
    languages: string[]
    skills: string[]
    experienceLevel: string
    interests: string[]
    projectPreferences: string[]
  }>
  onSubmit: (data: any) => void
  onSkip: () => void
  loading?: boolean
}

export default function OnboardingForm({ initialData = {}, onSubmit, onSkip, loading }: OnboardingFormProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: initialData.name || '',
    gender: initialData.gender || '',
    age: initialData.age || '',
    educationLevel: initialData.educationLevel || '',
    country: initialData.country || '',
    city: initialData.city || '',
    occupation: initialData.occupation || '',
    languages: initialData.languages || [],
    skills: initialData.skills || [],
    experienceLevel: initialData.experienceLevel || '',
    interests: initialData.interests || [],
    projectPreferences: initialData.projectPreferences || []
  })
  const [submitting, setSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addToArray = (field: string, value: string) => {
    const currentArray = form[field as keyof typeof form] as string[]
    if (value && !currentArray.includes(value)) {
      handleChange(field, [...currentArray, value])
    }
  }

  const removeFromArray = (field: string, value: string) => {
    const currentArray = form[field as keyof typeof form] as string[]
    handleChange(field, currentArray.filter((item: string) => item !== value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
  }

  const nextStep = () => setStep(2)
  const prevStep = () => setStep(1)

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 md:px-6">
      <Card className="w-full max-w-3xl bg-white/80 text-black border-neutral-200/80 shadow-2xl rounded-2xl backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-3">
            {step === 1 ? 'Personal Information' : 'Skills & Interests'}
          </CardTitle>
          <p className="text-zinc-400 text-base max-w-lg mx-auto leading-relaxed">
            {step === 1 
              ? 'Tell us a bit about yourself to personalize your experience. You can skip any field or the whole step.'
              : 'Help us recommend the best projects for you based on your skills and interests.'
            }
          </p>
          <div className="flex justify-center mt-6 space-x-3">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${step === 1 ? 'bg-orange-500 scale-110' : 'bg-zinc-600'}`} />
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${step === 2 ? 'bg-orange-500 scale-110' : 'bg-zinc-600'}`} />
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-black mb-2 block">Name</Label>
                  <Input 
                    id="name" 
                    value={form.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                    placeholder="Enter your name" 
                    className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-200 focus:border-orange-500 text-base py-3 rounded-lg transition-all duration-200" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-black mb-2 block">Gender</Label>
                    <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
                      <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-200 focus:border-orange-500 text-base py-3 rounded-lg">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-100 border-neutral-100">
                        <SelectItem value="male" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Male</SelectItem>
                        <SelectItem value="female" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Female</SelectItem>
                        <SelectItem value="other" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-black mb-2 block">Age</Label>
                    <Input 
                      id="age" 
                      value={form.age} 
                      onChange={e => handleChange('age', e.target.value)} 
                      placeholder="Enter your age" 
                      type="number"
                      min="13"
                      max="120"
                      className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-100 focus:border-orange-500 text-base py-3 rounded-lg transition-all duration-200" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="educationLevel" className="text-sm font-medium text-black mb-2 block">Education Level</Label>
                  <Select value={form.educationLevel} onValueChange={v => handleChange('educationLevel', v)}>
                    <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-100 border-neutral-100">
                      <SelectItem value="high_school" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">High School</SelectItem>
                      <SelectItem value="bachelor" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Bachelor's Degree</SelectItem>
                      <SelectItem value="master" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Master's Degree</SelectItem>
                      <SelectItem value="phd" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">PhD</SelectItem>
                      <SelectItem value="other" className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-black mb-2 block">Country</Label>
                    <Input 
                      id="country" 
                      value={form.country} 
                      onChange={e => handleChange('country', e.target.value)} 
                      placeholder="Enter your country" 
                      className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-200 focus:border-orange-500 text-base py-3 rounded-lg transition-all duration-200" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-black mb-2 block">City</Label>
                    <Input 
                      id="city" 
                      value={form.city} 
                      onChange={e => handleChange('city', e.target.value)} 
                      placeholder="Enter your city" 
                      className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-200 focus:border-orange-500 text-base py-3 rounded-lg transition-all duration-200" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="occupation" className="text-sm font-medium text-black mb-2 block">Occupation</Label>
                  <Input 
                    id="occupation" 
                    value={form.occupation} 
                    onChange={e => handleChange('occupation', e.target.value)} 
                    placeholder="Enter your occupation" 
                    className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:bg-neutral-200 focus:border-orange-500 text-base py-3 rounded-lg transition-all duration-200" 
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-end mt-10 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onSkip} 
                    disabled={submitting || loading} 
                    className="border-amber-400 text-amber-500 hover:bg-amber-600 hover:text-white hover:border-amber-600 py-3 px-6 text-base rounded-lg transition-all duration-200"
                  >
                    Skip 
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600 py-3 px-6 text-base rounded-lg transition-all duration-200 hover:shadow-xl"
                  >
                    Next: Skills & Interests
                  </Button>
                </div>
              </>
            ) : (
                <>
                <div>
                  <Label className="text-sm font-medium text-black mb-3 block">Experience Level</Label>
                  <Select value={form.experienceLevel} onValueChange={v => handleChange('experienceLevel', v)}>
                  <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-100 border-neutral-100">
                    {EXPERIENCE_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value.toLowerCase()} className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">
                      {level.label}
                    </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-black mb-3 block">Languages</Label>
                  <Select value="" onValueChange={v => {
                  if (v && !form.languages.includes(v)) {
                    handleChange('languages', [...form.languages, v])
                  }
                  }}>
                  <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                    <SelectValue placeholder="Select languages you can work in" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-100 border-neutral-100 max-h-48">
                    {HUMAN_LANGUAGES.filter(lang => !form.languages.includes(lang)).map(lang => (
                    <SelectItem key={lang} value={lang} className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">
                      {lang}
                    </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                  {form.languages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.languages.map((lang, index) => (
                    <Badge 
                      key={lang} 
                      className={`cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-colors ${
                      index === 0 
                        ? 'bg-orange-500/30 text-orange-700 border border-orange-500/50' 
                        : 'bg-neutral-200 text-black border border-neutral-300'
                      }`}
                      onClick={() => removeFromArray('languages', lang)}
                    >
                      {lang} {index === 0 && '(Primary)'} <X className="w-3 h-3 ml-1" />
                    </Badge>
                    ))}
                  </div>
                  )}
                  <p className="text-zinc-400 text-xs mt-2">Click on a language to add it. First selected will be your primary language.</p>
                </div>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                  <div>
                    <Label className="text-sm font-medium text-black mb-3 block">Skills</Label>
                    <Select value="" onValueChange={v => {
                    if (v && !form.skills.includes(v)) {
                      handleChange('skills', [...form.skills, v])
                    }
                    }}>
                    <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                      <SelectValue placeholder="Select your skills" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-100 border-neutral-100 max-h-48">
                      {COMMON_SKILLS.filter(skill => !form.skills.includes(skill)).map(skill => (
                      <SelectItem key={skill} value={skill} className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">
                        {skill}
                      </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-black mb-3 block">Add Custom Skill</Label>
                    <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      placeholder="Add a custom skill..."
                      className="bg-neutral-100/80 border-neutral-100 text-black placeholder:text-zinc-400 focus:border-orange-500 text-base py-3 rounded-lg flex-1"
                      onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
                        handleChange('skills', [...form.skills, newSkill.trim()])
                        setNewSkill('')
                        }
                      }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                      if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
                        handleChange('skills', [...form.skills, newSkill.trim()])
                        setNewSkill('')
                      }
                      }}
                      className="border-neutral-300 text-black hover:bg-neutral-200 hover:text-black rounded-lg px-4 py-3"
                    >
                      <Plus className="w-4 h-4 text-black" />
                    </Button>
                    </div>
                  </div>
                  </div>

                  {form.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.skills.map((skill, index) => (
                    <Badge 
                      key={skill} 
                      className={`cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-colors ${
                      index === 0 
                        ? 'bg-orange-500/30 text-orange-700 border border-orange-500/50' 
                        : 'bg-neutral-200 text-black border border-neutral-300'
                      }`}
                      onClick={() => removeFromArray('skills', skill)}
                    >
                      {skill} {index === 0 && '(Primary)'} <X className="w-3 h-3 ml-1" />
                    </Badge>
                    ))}
                  </div>
                  )}
                  <p className="text-zinc-400 text-xs mt-2">Click on skills to add them or add custom skills. First selected will be your primary skill.</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-black mb-3 block">Areas of Interest</Label>
                  <Select value="" onValueChange={v => {
                  if (v && !form.interests.includes(v)) {
                    handleChange('interests', [...form.interests, v])
                  }
                  }}>
                  <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                    <SelectValue placeholder="Select categories that interest you" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-100 border-neutral-100 max-h-48">
                    {INTEREST_CATEGORIES.filter(category => !form.interests.includes(category)).map(category => (
                    <SelectItem key={category} value={category} className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">
                      {category}
                    </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                  {form.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.interests.map((interest, index) => (
                    <Badge 
                      key={interest} 
                      className={`cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-colors ${
                      index === 0 
                        ? 'bg-orange-500/30 text-orange-700 border border-orange-500/50' 
                        : 'bg-neutral-200 text-black border border-neutral-300'
                      }`}
                      onClick={() => removeFromArray('interests', interest)}
                    >
                      {interest} <X className="w-3 h-3 ml-1" />
                    </Badge>
                    ))}
                  </div>
                  )}
                  <p className="text-zinc-400 text-xs mt-2">Select areas that interest you for better project matching.</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-black mb-3 block">Project Preferences</Label>
                  <Select value="" onValueChange={v => {
                  if (v && !form.projectPreferences.includes(v)) {
                    handleChange('projectPreferences', [...form.projectPreferences, v])
                  }
                  }}>
                  <SelectTrigger className="bg-neutral-100/80 border-neutral-100 text-black focus:border-orange-500 text-base py-3 rounded-lg">
                    <SelectValue placeholder="Select project types that interest you" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-100 border-neutral-100 max-h-48">
                    {PROJECT_PREFERENCES.filter(type => !form.projectPreferences.includes(type)).map(type => (
                    <SelectItem key={type} value={type} className="text-black hover:text-black focus:text-black hover:bg-neutral-200 focus:bg-neutral-200">
                      {type}
                    </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                  {form.projectPreferences.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.projectPreferences.map((pref, index) => (
                    <Badge 
                      key={pref} 
                      className={`cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-colors ${
                      index === 0 
                        ? 'bg-orange-500/30 text-orange-700 border border-orange-500/50' 
                        : 'bg-neutral-200 text-black border border-neutral-300'
                      }`}
                      onClick={() => removeFromArray('projectPreferences', pref)}
                    >
                      {pref} {index === 0 && '(Primary)'} <X className="w-3 h-3 ml-1" />
                    </Badge>
                    ))}
                  </div>
                  )}
                  <p className="text-zinc-400 text-xs mt-2">Click on project types to add them. First selected will be your primary interest.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between mt-10 pt-6 border-t border-neutral-200">
                  <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="border-neutral-300 bg-white text-black hover:text-white hover:bg-orange-500 hover:border-orange-500 py-3 px-6 text-base rounded-lg transition-all duration-200"
                  >
                  Back
                  </Button>
                  <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onSkip} 
                    disabled={submitting || loading}
                    className="border-neutral-300 bg-white text-black hover:text-white hover:bg-orange-500 hover:border-orange-500 py-3 px-6 text-base rounded-lg transition-all duration-200"
                  >
                    Skip
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || loading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600 py-3 px-8 text-base rounded-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Complete Setup'}
                  </Button>
                  </div>
                </div>
                </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
