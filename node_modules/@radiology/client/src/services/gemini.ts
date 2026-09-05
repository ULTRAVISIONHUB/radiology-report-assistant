// Gemini API Service for radiology report generation

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[]
    }
    finishReason?: string
  }[]
  error?: {
    message: string
    code: number
  }
}

function getApiKey(): string | null {
  return localStorage.getItem('gemini_api_key')
}

function getModel(): string {
  return localStorage.getItem('gemini_model') || 'gemini-2.5-flash'
}

export async function generateReportFromImage(
  allImages: { base64: string; mimeType: string }[],
  clinicalIndication: string,
  clinicalHistory: string,
  patientContext: string,
  symptoms: string[],
  clinicalSuspicions: string[],
  roi: string,
  guidelines: string,
  roiBox: { x: number; y: number; w: number; h: number } | null,
  laterality: string,
  contrastUsed: string,
  imageQuality: string,
  bodyHabitus: string,
  pregnancyStatus: string,
  comorbidities: string,
  physicalExam: string,
  labValues: string
): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Go to Settings to add your API key.')
  }

  const model = getModel()
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`

  const imageCount = allImages.length
  const imageInstruction = imageCount > 1
    ? `Analyze ALL ${imageCount} provided images and synthesize a unified comprehensive report based on findings across all images.`
    : `Analyze the provided medical image and generate a structured radiology report.`

  const roiText = roi ? `Region of Interest (ROI): ${roi}` : ''
  const roiBoxText = roiBox
    ? `ROI Bounding Box (canvas coordinates): x=${Math.round(roiBox.x)}, y=${Math.round(roiBox.y)}, width=${Math.round(roiBox.w)}, height=${Math.round(roiBox.h)}. Focus your analysis on this region.`
    : ''
  const symptomsText = symptoms.length > 0 ? `Reported Symptoms: ${symptoms.join(', ')}` : ''
  const suspicionsText = clinicalSuspicions.length > 0 ? `Clinical Suspicion(s): ${clinicalSuspicions.join(', ')}` : ''
  const guidelinesText = guidelines && guidelines !== 'None' ? `Apply Guideline: ${guidelines}` : ''

  const lateralityText = laterality ? `Laterality: ${laterality}` : ''
  const contrastText = contrastUsed ? `Contrast Used: ${contrastUsed}` : ''
  const qualityText = imageQuality ? `Image Quality: ${imageQuality}` : ''
  const bodyHabitusText = bodyHabitus ? `Body Habitus: ${bodyHabitus}` : ''
  const pregnancyText = pregnancyStatus ? `Pregnancy Status: ${pregnancyStatus}` : ''
  const comorbiditiesText = comorbidities ? `Comorbidities: ${comorbidities}` : ''
  const physicalExamText = physicalExam ? `Physical Exam Findings: ${physicalExam}` : ''
  const labValuesText = labValues ? `Relevant Lab Values: ${labValues}` : ''
  const clinicalHistoryText = clinicalHistory ? `Clinical History: ${clinicalHistory}` : ''
  const clinicalIndicationText = clinicalIndication ? `Clinical Indication / Reason for Exam: ${clinicalIndication}` : ''

  const prompt = `You are an expert board-certified radiologist. Analyze the provided medical images and generate a comprehensive, accurate structured radiology report.

${imageInstruction}

=== PATIENT CONTEXT ===
${patientContext ? `Patient: ${patientContext}` : ''}
${pregnancyText}
${bodyHabitusText}
${comorbiditiesText}
${labValuesText}

=== CLINICAL CONTEXT ===
${clinicalHistoryText}
${clinicalIndicationText}
${symptomsText}
${physicalExamText}

=== IMAGING CONTEXT ===
${roiText}
${lateralityText}
${contrastText}
${qualityText}

=== DIAGNOSTIC FRAMEWORK ===
${suspicionsText}
${guidelinesText}
${roiBoxText}

Analyze ALL provided images. Synthesize findings into a unified report. Be specific, use standardized terminology. If a finding is uncertain, state the level of confidence.

Provide a structured report with these sections:

**CLINICAL HISTORY:**
(Brief relevant history based on the clinical context provided)

**TECHNIQUE:**
(Imaging modality, technique, and parameters)

**FINDINGS:**
(Detailed description of all findings, organized by anatomical region and significance)

**IMPRESSION:**
(Summary of key findings and primary diagnosis with differential if appropriate)

**RECOMMENDATIONS:**
(Follow-up suggestions, additional imaging, or clinical correlation if any)

Be thorough, professional, and use standard radiological terminology. If critical findings are present, clearly highlight them.`

  const parts: any[] = [{ text: prompt }]
  for (const img of allImages) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.base64,
      },
    })
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data: GeminiResponse = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No report generated')
  return text
}

export async function generateReportFromText(
  clinicalIndication: string,
  clinicalHistory: string,
  modality: string,
  bodyPart: string,
  patientContext: string,
  symptoms: string[],
  clinicalSuspicions: string[],
  roi: string,
  guidelines: string,
  laterality: string,
  contrastUsed: string,
  imageQuality: string,
  bodyHabitus: string,
  pregnancyStatus: string,
  comorbidities: string,
  physicalExam: string,
  labValues: string
): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Go to Settings to add your API key.')
  }

  const model = getModel()
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`

  const symptomsText = symptoms.length > 0 ? `Reported Symptoms: ${symptoms.join(', ')}` : ''
  const suspicionsText = clinicalSuspicions.length > 0 ? `Clinical Suspicion(s): ${clinicalSuspicions.join(', ')}` : ''
  const guidelinesText = guidelines && guidelines !== 'None' ? `Apply Guideline: ${guidelines}` : ''
  const roiText = roi ? `Region of Interest (ROI): ${roi}` : ''

  const lateralityText = laterality ? `Laterality: ${laterality}` : ''
  const contrastText = contrastUsed ? `Contrast Used: ${contrastUsed}` : ''
  const qualityText = imageQuality ? `Image Quality: ${imageQuality}` : ''
  const bodyHabitusText = bodyHabitus ? `Body Habitus: ${bodyHabitus}` : ''
  const pregnancyText = pregnancyStatus ? `Pregnancy Status: ${pregnancyStatus}` : ''
  const comorbiditiesText = comorbidities ? `Comorbidities: ${comorbidities}` : ''
  const physicalExamText = physicalExam ? `Physical Exam Findings: ${physicalExam}` : ''
  const labValuesText = labValues ? `Relevant Lab Values: ${labValues}` : ''
  const clinicalHistoryText = clinicalHistory ? `Clinical History: ${clinicalHistory}` : ''
  const clinicalIndicationText = clinicalIndication ? `Clinical Indication / Reason for Exam: ${clinicalIndication}` : ''

  const prompt = `You are an expert board-certified radiologist. Generate a comprehensive, accurate structured radiology report based on the provided clinical and imaging context.

=== PATIENT CONTEXT ===
${patientContext ? `Patient: ${patientContext}` : ''}
${pregnancyText}
${bodyHabitusText}
${comorbiditiesText}
${labValuesText}

=== CLINICAL CONTEXT ===
${clinicalHistoryText}
${clinicalIndicationText}
${symptomsText}
${physicalExamText}

=== IMAGING CONTEXT ===
Modality: ${modality}
Body Part / Region: ${bodyPart}
${roiText}
${lateralityText}
${contrastText}
${qualityText}

=== DIAGNOSTIC FRAMEWORK ===
${suspicionsText}
${guidelinesText}

Provide a structured report with these sections:

**CLINICAL HISTORY:**
(Brief relevant history)

**TECHNIQUE:**
(Imaging modality, technique, and parameters)

**FINDINGS:**
(Detailed description of all expected and potential findings, organized by anatomical region)

**IMPRESSION:**
(Summary of key findings and primary diagnosis with differential if appropriate)

**RECOMMENDATIONS:**
(Follow-up suggestions, additional imaging, or clinical correlation if any)

Be thorough, professional, and use standard radiological terminology. If critical findings are present, clearly highlight them.`

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data: GeminiResponse = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No report generated')
  return text
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const url = `${GEMINI_API_BASE}/models?key=${apiKey}&pageSize=1`
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}
