import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import ExcelIcon from '@mui/icons-material/TableChart';
import PersonIcon from '@mui/icons-material/Person';
import ReportIcon from '@mui/icons-material/Assessment';
import { useHebrewCalendar } from '../contexts/HebrewCalendarContext';
import { useSynagogue } from '../contexts/SynagogueContext';

interface AnnualReportData {
  congregantName: string;
  openingBalance: number;
  aliyot: { date: string, type: string, amount: number }[];
  purchases: { date: string, type: string, amount: number }[];
  pledges: { date: string, description: string, amount: number }[];
  payments: { date: string, method: string, amount: number }[];
  totalCharges: number;
  totalPayments: number;
  closingBalance: number;
}

const Reports: React.FC = () => {
  const { currentHebrewYear, hebrewYears } = useHebrewCalendar();
  const { currentSynagogue } = useSynagogue();
  
  const [selectedYear, setSelectedYear] = useState(currentHebrewYear?.id || '');
  const [selectedCongregant, setSelectedCongregant] = useState('');
  const [reportData, setReportData] = useState<AnnualReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const congregants = [
    'יוסף כהן', 'דוד לוי', 'משה אברהם', 'אהרן ישראל', 'יעקב שמואל'
  ];

  // Mock report data
  const generateMockReport = (congregantName: string): AnnualReportData => {
    return {
      congregantName,
      openingBalance: -150,
      aliyot: [
        { date: 'ט״ו בשבט תשפ״ה', type: 'כהן', amount: 180 },
        { date: 'כ״ב בשבט תשפ״ה', type: 'לוי', amount: 150 },
        { date: 'כ״ט בשבט תשפ״ה', type: 'שלישי', amount: 120 }
      ],
      purchases: [
        { date: 'ח׳ בשבט תשפ״ה', type: 'הגבהה', amount: 100 },
        { date: 'ט״ו באדר תשפ״ה', type: 'פתיחת ההיכל', amount: 200 }
      ],
      pledges: [
        { date: 'כ״ב בשבט תשפ״ה', description: 'קידוש לבת', amount: 300 },
        { date: 'ח׳ באדר תשפ״ה', description: 'סעודה שלישית', amount: 250 }
      ],
      payments: [
        { date: 'ט״ו בשבט תשפ״ה', method: 'מזומן', amount: 180 },
        { date: 'כ״ב בשבט תשפ״ה', method: 'צ\'ק', amount: 400 },
        { date: 'ח׳ באדר תשפ״ה', method: 'העברה', amount: 300 }
      ],
      totalCharges: 1300,
      totalPayments: 880,
      closingBalance: -570
    };
  };

  const handleGenerateReport = async () => {
    if (!selectedCongregant) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = generateMockReport(selectedCongregant);
      setReportData(data);
      setLoading(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    // This would generate a PDF report
    console.log('Exporting PDF report for:', selectedCongregant);
    alert('יצוא PDF יתבצע בקרוב...');
  };

  const handleExportExcel = () => {
    // This would generate an Excel report
    console.log('Exporting Excel report for:', selectedCongregant);
    alert('יצוא Excel יתבצע בקרוב...');
  };

  const summaryReports = [
    {
      title: 'דוח גבאים - חיובים פתוחים',
      description: 'רשימת כל החיובים הפתוחים לפי מתפללים',
      icon: <ReportIcon />
    },
    {
      title: 'דוח הכנסות חודשי',
      description: 'סיכום הכנסות לפי חודשים עבריים',
      icon: <ReportIcon />
    },
    {
      title: 'דוח עליות לתורה',
      description: 'פירוט עליות לתורה לפי פרשות',
      icon: <ReportIcon />
    },
    {
      title: 'דוח התחייבויות',
      description: 'מעקב אחר קידושים וסעודות שלישית',
      icon: <ReportIcon />
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        דוחות ותקצירים
      </Typography>

      <Grid container spacing={3}>
        {/* Individual Report Generator */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                דוח שנתי למתפלל
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>שנה עברית</InputLabel>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      label="שנה עברית"
                    >
                      {hebrewYears.map((year) => (
                        <MenuItem key={year.id} value={year.id}>
                          {year.yearLabel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={congregants}
                    value={selectedCongregant}
                    onChange={(_, value) => setSelectedCongregant(value || '')}
                    renderInput={(params) => <TextField {...params} label="מתפלל" />}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={!selectedCongregant || loading}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    {loading ? 'מכין דוח...' : 'הכן דוח'}
                  </Button>
                </Grid>
              </Grid>

              {reportData && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      דוח שנתי - {reportData.congregantName}
                    </Typography>
                    <Box>
                      <Button
                        startIcon={<PdfIcon />}
                        onClick={handleExportPDF}
                        sx={{ mr: 1 }}
                      >
                        PDF
                      </Button>
                      <Button
                        startIcon={<ExcelIcon />}
                        onClick={handleExportExcel}
                      >
                        Excel
                      </Button>
                    </Box>
                  </Box>

                  {/* Report Header */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {currentSynagogue?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      דוח שנתי לשנת {currentHebrewYear?.yearLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reportData.congregantName}
                    </Typography>
                  </Paper>

                  {/* Balance Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography color="text.secondary">יתרת פתיחה</Typography>
                          <Typography variant="h6" color={reportData.openingBalance < 0 ? 'error' : 'success'}>
                            ₪{Math.abs(reportData.openingBalance)}
                            {reportData.openingBalance < 0 ? ' (חוב)' : ''}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography color="text.secondary">חיובים השנה</Typography>
                          <Typography variant="h6" color="error">
                            ₪{reportData.totalCharges}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography color="text.secondary">תשלומים השנה</Typography>
                          <Typography variant="h6" color="success">
                            ₪{reportData.totalPayments}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography color="text.secondary">יתרת סגירה</Typography>
                          <Typography variant="h6" color={reportData.closingBalance < 0 ? 'error' : 'success'}>
                            ₪{Math.abs(reportData.closingBalance)}
                            {reportData.closingBalance < 0 ? ' (חוב)' : ''}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Detailed Tables */}
                  <Typography variant="h6" gutterBottom>פירוט עליות לתורה</Typography>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>תאריך</TableCell>
                          <TableCell>סוג עלייה</TableCell>
                          <TableCell align="right">סכום</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.aliyot.map((aliyah, index) => (
                          <TableRow key={index}>
                            <TableCell>{aliyah.date}</TableCell>
                            <TableCell>{aliyah.type}</TableCell>
                            <TableCell align="right">₪{aliyah.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" gutterBottom>התחייבויות</Typography>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>תאריך</TableCell>
                          <TableCell>תיאור</TableCell>
                          <TableCell align="right">סכום</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.pledges.map((pledge, index) => (
                          <TableRow key={index}>
                            <TableCell>{pledge.date}</TableCell>
                            <TableCell>{pledge.description}</TableCell>
                            <TableCell align="right">₪{pledge.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" gutterBottom>תשלומים</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>תאריך</TableCell>
                          <TableCell>אמצעי תשלום</TableCell>
                          <TableCell align="right">סכום</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.payments.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell align="right">₪{payment.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Reports */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            דוחות מסכמים
          </Typography>
          {summaryReports.map((report, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {report.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" component="h3">
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<PdfIcon />}>
                  PDF
                </Button>
                <Button size="small" startIcon={<ExcelIcon />}>
                  Excel
                </Button>
              </CardActions>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
