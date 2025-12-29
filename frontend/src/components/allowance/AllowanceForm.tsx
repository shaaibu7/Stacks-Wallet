import React, { useState } from 'react';
import { AllowanceFormData } from '../../types/allowance';
import './allowance.css';

interface AllowanceFormProps {
  onSubmit: (data: AllowanceFormData) => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

const AllowanceForm: React.FC<AllowanceFormProps> = ({
  onSubmit,
  loading,
  error,
  onClearError,
}) => {
  const [formData, setFormData] = useState<AllowanceFormData>({
    spender: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.spender && formData.amount) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AllowanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      onClearError();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="allowance-form">
      <div className="grid two">
        <label className="field">
          <span>Spender Address</span>
          <input
            type="text"
            value={formData.spender}
            onChange={(e) => handleInputChange('spender', e.target.value)}
            placeholder="ST... address to grant allowance"
            required
          />
        </label>
        <label className="field">
          <span>Amount</span>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="Amount to approve"
            min="0"
            step="1"
            required
          />
        </label>
      </div>
      
      {error && (
        <div className="error" style={{ marginTop: '1rem' }}>
          {error}
          <button 
            type="button" 
            onClick={onClearError}
            style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="actions" style={{ marginTop: '1rem' }}>
        <button type="submit" disabled={loading || !formData.spender || !formData.amount}>
          {loading ? 'Approving...' : 'Approve Allowance'}
        </button>
      </div>
    </form>
  );
};

export default AllowanceForm;