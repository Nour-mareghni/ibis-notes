import { useState, useEffect } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { CalendarDays, LogOut, Plus, MessageSquare, Trash2, Edit2, Check } from 'lucide-react';
import type { User as UserType, Note } from '@/types';

// True red ibis color
const IBIS_RED = '#FF0000';
const IBIS_RED_HOVER = '#CC0000';

// Mock staff users
const STAFF_USERS: UserType[] = [
  { id: '1', email: 'aita@accor.com', name: 'aita', password: 'ACCOR2026++' },
  { id: '2', email: 'amine@accor.com', name: 'amine', password: 'ACCOR2026++' },
  { id: '3', email: 'angelique@accor.com', name: 'angelique', password: 'ACCOR2026++' },
  { id: '4', email: 'julieta@accor.com', name: 'julieta', password: 'ACCOR2026++' },
  { id: '5', email: 'anais@accor.com', name: 'anais', password: 'ACCOR2026++' },
  { id: '6', email: 'maty@accor.com', name: 'maty', password: 'ACCOR2026++' },
  { id: '7', email: 'elena@accor.com', name: 'elena', password: 'ACCOR2026++' },
  { id: '8', email: 'rubel@accor.com', name: 'rubel', password: 'ACCOR2026++' },
  { id: '9', email: 'ali@accor.com', name: 'ali', password: 'ACCOR2026++' },
  { id: '10', email: 'abdoulah@accor.com', name: 'abdoulah', password: 'ACCOR2026++' },
  { id: '11', email: 'meriam@accor.com', name: 'meriam', password: 'ACCOR2026++' },
  { id: '12', email: 'johan@accor.com', name: 'johan', password: 'ACCOR2026++' },
  { id: '13', email: 'antoine@accor.com', name: 'antoine', password: 'ACCOR2026++' },
  { id: '14', email: 'fatima@accor.com', name: 'fatima', password: 'ACCOR2026++' },
  { id: '15', email: 'takwa@accor.com', name: 'takwa', password: 'takwa2001' },
  

];

// Mock initial notes
const INITIAL_NOTES: Note[] = [

];

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ibis_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = STAFF_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('ibis_current_user', JSON.stringify(user));
      toast.success(`Bienvenue, ${user.name} !`);
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ibis_current_user');
    setEmail('');
    setPassword('');
    toast.info('Déconnexion réussie');
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !currentUser) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      date: selectedDate.toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
      done: false,
    };

    setNotes([...notes, newNote]);
    setNewNoteContent('');
    setIsAddDialogOpen(false);
    toast.success('Note ajoutée avec succès');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
    toast.success('Note supprimée');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editingNote || !editContent.trim()) return;

    setNotes(notes.map(n => 
      n.id === editingNote.id 
        ? { ...n, content: editContent.trim() }
        : n
    ));
    setEditingNote(null);
    setEditContent('');
    toast.success('Note modifiée avec succès');
  };

  const handleToggleDone = (noteId: string) => {
    setNotes(notes.map(n => 
      n.id === noteId 
        ? { ...n, done: !n.done }
        : n
    ));
    toast.success('Statut mis à jour');
  };

  const getNotesForDate = (date: Date) => {
    return notes.filter(note => isSameDay(parseISO(note.date), date));
  };

  const getDatesWithNotes = () => {
    return notes.map(note => parseISO(note.date));
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/fr/thumb/d/d6/Ibis_H%C3%B4tel_logo_2012.png/250px-Ibis_H%C3%B4tel_logo_2012.png" 
                alt="ibis Hôtel"
                className="h-20 object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ibis Paris Gare du Nord
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Château-Landon</p>
            </div>
            <div className="pt-2">
              <h2 className="text-lg font-semibold text-gray-700">Espace Personnel</h2>
              <p className="text-sm text-gray-500">Connectez-vous pour accéder aux notes</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-white font-semibold"
                style={{ backgroundColor: IBIS_RED }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = IBIS_RED_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = IBIS_RED}
              >
                Se connecter
              </Button>
            </form>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Comptes de démonstration :
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-400 text-center">
                <p>marie@ibis.fr / marie123</p>
                <p>pierre@ibis.fr / pierre123</p>
                <p>sophie@ibis.fr / sophie123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main App Screen
  const selectedDateNotes = getNotesForDate(selectedDate);
  const datesWithNotes = getDatesWithNotes();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://upload.wikimedia.org/wikipedia/fr/thumb/d/d6/Ibis_H%C3%B4tel_logo_2012.png/250px-Ibis_H%C3%B4tel_logo_2012.png" 
                alt="ibis Hôtel"
                className="h-10 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">ibis Paris Gare du Nord</h1>
                <p className="text-xs text-gray-500">Château-Landon</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8" style={{ backgroundColor: IBIS_RED }}>
                  <AvatarFallback className="text-white text-sm" style={{ backgroundColor: IBIS_RED }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {currentUser.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-500 hover:bg-red-50"
                style={{ '--hover-color': IBIS_RED } as React.CSSProperties}
              >
                <LogOut className="w-4 h-4" style={{ color: IBIS_RED }} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Notes Section - Main focus (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="shadow-md border-0 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" style={{ color: IBIS_RED }} />
                    Notes du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="text-white"
                        style={{ backgroundColor: IBIS_RED }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Nouvelle note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Date : {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                          </label>
                        </div>
                        <Textarea
                          placeholder="Écrivez votre note ici..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Annuler
                          </Button>
                          <Button 
                            onClick={handleAddNote}
                            className="text-white"
                            style={{ backgroundColor: IBIS_RED }}
                            disabled={!newNoteContent.trim()}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {selectedDateNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-center">Aucune note pour cette date</p>
                      <p className="text-sm text-center mt-1">Cliquez sur "Ajouter" pour créer une note</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateNotes.map((note) => (
                        <div 
                          key={note.id} 
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                            note.done ? 'border-green-300 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          {editingNote?.id === note.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingNote(null)}
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="text-white"
                                  style={{ backgroundColor: IBIS_RED }}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-gray-800 whitespace-pre-wrap text-base ${
                                note.done ? 'line-through text-gray-500' : ''
                              }`}>
                                {note.content}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                      {note.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">{note.userName}</span>
                                  <span className="text-xs text-gray-400">
                                    {format(parseISO(note.createdAt), 'HH:mm')}
                                  </span>
                                  {note.done && (
                                    <span className="text-xs text-green-600 font-medium">✓ Terminé</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 w-7 p-0 hover:bg-green-100 ${
                                      note.done ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                    onClick={() => handleToggleDone(note.id)}
                                    title={note.done ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-400 hover:bg-red-50"
                                    onClick={() => handleEditNote(note)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" style={{ color: IBIS_RED }} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-400 hover:bg-red-50"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" style={{ color: IBIS_RED }} />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section - Smaller (4 cols) */}
          <div className="lg:col-span-4">
            <Card className="shadow-md border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" style={{ color: IBIS_RED }} />
                  Calendrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="calendar-wrapper">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full custom-calendar"
                    modifiers={{
                      hasNotes: datesWithNotes,
                    }}
                    modifiersStyles={{
                      hasNotes: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: IBIS_RED,
                        textDecorationThickness: '3px',
                      },
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: IBIS_RED }}></div>
                    <span>Date sélectionnée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-b-3" style={{ borderBottom: `3px solid ${IBIS_RED}` }}></div>
                    <span>Notes disponibles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
