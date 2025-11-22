'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lightbulb, Code, Palette, CheckCircle2 } from 'lucide-react';

interface ScoringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    id: string;
    project_title: string;
  };
  existingScore?: {
    innovation: number;
    technical_execution: number;
    design_ux: number;
    completeness: number;
    notes: string | null;
  } | null;
  onScoreSaved: () => void;
}

export function ScoringModal({
  open,
  onOpenChange,
  submission,
  existingScore,
  onScoreSaved
}: ScoringModalProps) {
  const [innovation, setInnovation] = useState(existingScore?.innovation || 0);
  const [technicalExecution, setTechnicalExecution] = useState(existingScore?.technical_execution || 0);
  const [designUx, setDesignUx] = useState(existingScore?.design_ux || 0);
  const [completeness, setCompleteness] = useState(existingScore?.completeness || 0);
  const [notes, setNotes] = useState(existingScore?.notes || '');
  const [loading, setLoading] = useState(false);

  // Update state when existingScore changes
  useEffect(() => {
    if (existingScore) {
      setInnovation(existingScore.innovation);
      setTechnicalExecution(existingScore.technical_execution);
      setDesignUx(existingScore.design_ux);
      setCompleteness(existingScore.completeness);
      setNotes(existingScore.notes || '');
    }
  }, [existingScore]);

  // Calculate total score (sum × 2.5 = out of 100)
  const rawTotal = innovation + technicalExecution + designUx + completeness;
  const totalScore = Math.round(rawTotal * 2.5);

  const handleSave = async () => {
    // Validate ranges
    if (innovation < 0 || innovation > 10) {
      toast.error('Innovation must be between 0-10');
      return;
    }
    if (technicalExecution < 0 || technicalExecution > 10) {
      toast.error('Technical Execution must be between 0-10');
      return;
    }
    if (designUx < 0 || designUx > 10) {
      toast.error('Design/UX must be between 0-10');
      return;
    }
    if (completeness < 0 || completeness > 10) {
      toast.error('Completeness must be between 0-10');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/submissions/${submission.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innovation,
          technical_execution: technicalExecution,
          design_ux: designUx,
          completeness,
          total_score: totalScore,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }

      toast.success(`Score saved: ${totalScore}/100`);
      onScoreSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving score:', error);
      toast.error(error.message || 'Failed to save score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-devcard-base border-devcard-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-devcard-heading text-xl">
            Score Submission
          </DialogTitle>
          <DialogDescription className="text-devcard-text">
            {submission.project_title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Innovation */}
          <div className="space-y-2">
            <Label className="text-devcard-heading flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Innovation - Creativity and novelty
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="10"
                value={innovation}
                onChange={(e) => setInnovation(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                className="bg-devcard-base border-devcard-border text-devcard-heading w-24"
              />
              <span className="text-sm text-devcard-text">out of 10</span>
            </div>
          </div>

          {/* Technical Execution */}
          <div className="space-y-2">
            <Label className="text-devcard-heading flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              Technical Execution - Code quality and difficulty
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="10"
                value={technicalExecution}
                onChange={(e) => setTechnicalExecution(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                className="bg-devcard-base border-devcard-border text-devcard-heading w-24"
              />
              <span className="text-sm text-devcard-text">out of 10</span>
            </div>
          </div>

          {/* Design/UX */}
          <div className="space-y-2">
            <Label className="text-devcard-heading flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-500" />
              Design/UX - User experience and visual appeal
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="10"
                value={designUx}
                onChange={(e) => setDesignUx(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                className="bg-devcard-base border-devcard-border text-devcard-heading w-24"
              />
              <span className="text-sm text-devcard-text">out of 10</span>
            </div>
          </div>

          {/* Completeness */}
          <div className="space-y-2">
            <Label className="text-devcard-heading flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-devcard-green" />
              Completeness - Polish and finish level
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="10"
                value={completeness}
                onChange={(e) => setCompleteness(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                className="bg-devcard-base border-devcard-border text-devcard-heading w-24"
              />
              <span className="text-sm text-devcard-text">out of 10</span>
            </div>
          </div>

          {/* Total Score Display */}
          <div className="pt-4 border-t border-devcard-border">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-devcard-heading">Total Score</span>
              <div className="text-right">
                <div className="text-3xl font-bold text-devcard-green">
                  {totalScore}
                  <span className="text-xl text-devcard-text">/100</span>
                </div>
                <div className="text-xs text-devcard-text">
                  ({rawTotal}/40 × 2.5)
                </div>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label className="text-devcard-heading">
              Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any feedback or comments..."
              className="bg-devcard-base border-devcard-border text-devcard-heading min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-devcard-border text-devcard-text"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-devcard-green hover:bg-devcard-green/90 text-black"
          >
            {loading ? 'Saving...' : 'Save Score'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
