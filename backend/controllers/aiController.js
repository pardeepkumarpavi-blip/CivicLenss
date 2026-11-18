import { analyzeReportWithGemini, isGeminiConfigured } from '../services/geminiService.js';
import fs from 'fs';

export const analyzeReport = async (req, res, next) => {
  try {
    const { description, category } = req.body;
    const file = req.file;

    if (!isGeminiConfigured()) {
      return res.status(200).json({
        success: false,
        available: false,
        message: 'AI analysis is currently unavailable. You can continue with manual complaint submission.'
      });
    }

    if (!file && !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a photograph or a detailed text description for AI analysis.'
      });
    }

    const result = await analyzeReportWithGemini({
      filePath: file ? file.path : null,
      mimeType: file ? file.mimetype : 'image/jpeg',
      userDescription: description || '',
      userCategory: category || ''
    });

    if (!result.available) {
      return res.status(200).json({
        success: false,
        available: false,
        message: result.message || 'AI analysis is currently unavailable. You can continue with manual complaint submission.'
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      analysis: result.analysis
    });
  } catch (error) {
    console.error('[AI Controller Error]', error);
    return res.status(200).json({
      success: false,
      available: false,
      message: 'AI analysis is currently unavailable. You can continue with manual complaint submission.'
    });
  }
};
