import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { Categoria, CategoriaPayload } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface CategoriaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (categoria: CategoriaPayload) => void;
  categoria?: Categoria;
  loading?: boolean;
}

const CategoriaForm: React.FC<CategoriaFormProps> = ({
  open,
  onClose,
  onSubmit,
  categoria,
  loading = false
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<CategoriaPayload>({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    setFormData({
      nombre: categoria?.nombre || '',
      descripcion: categoria?.descripcion || ''
    });
  }, [categoria, open]);

  const handleChange = (field: keyof CategoriaPayload) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {categoria ? t('Editar Categoría', 'Edit Category') : t('Nueva Categoría', 'New Category')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('Nombre', 'Name')}
              value={formData.nombre}
              onChange={handleChange('nombre')}
              required
              fullWidth
            />
            <TextField
              label={t('Descripción', 'Description')}
              value={formData.descripcion || ''}
              onChange={handleChange('descripcion')}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t('Cancelar', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.nombre.trim()}
          >
            {loading ? t('Guardando...', 'Saving...') : (categoria ? t('Actualizar', 'Update') : t('Crear', 'Create'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoriaForm;
