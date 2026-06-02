import os
from flask import Blueprint, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import db, Prediction, Report, User
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

reports_bp = Blueprint('reports', __name__)

def build_pdf_report(pdf_path, prediction, user):
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom colors
    primary_color = colors.HexColor("#15803D")  # Secondary Green
    accent_color = colors.HexColor("#84CC16")   # Lime Accent
    dark_neutral = colors.HexColor("#1E293B")   # Slate 800
    light_neutral = colors.HexColor("#F8FAFC")  # Slate 50
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=primary_color,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=25
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=dark_neutral,
        leading=14
    )
    
    banner_style = ParagraphStyle(
        'BannerText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.white,
        alignment=1  # Centered
    )

    # Document Header
    story.append(Paragraph("AGROMIND AI - SMART CROP REPORT", title_style))
    story.append(Paragraph(f"Generated on: {prediction.created_at.strftime('%Y-%m-%d %H:%M:%S')} | Report Ref: #AM-{prediction.id:04d}", subtitle_style))
    story.append(Spacer(1, 10))

    # Farmer Details Table
    farmer_data = [
        [Paragraph("<b>Farmer Name:</b>", body_style), Paragraph(user.name, body_style),
         Paragraph("<b>Email:</b>", body_style), Paragraph(user.email, body_style)],
        [Paragraph("<b>Location:</b>", body_style), Paragraph(f"{prediction.district or 'N/A'}, {prediction.state or 'N/A'}", body_style),
         Paragraph("<b>Season:</b>", body_style), Paragraph(prediction.season or 'N/A', body_style)]
    ]
    t_farmer = Table(farmer_data, colWidths=[100, 160, 80, 180])
    t_farmer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_neutral),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(t_farmer)
    story.append(Spacer(1, 20))

    # Prediction Banner (Recommended Crop)
    banner_data = [[
        Paragraph(f"RECOMMENDED CROP: {prediction.crop.upper()} &nbsp;&nbsp;|&nbsp;&nbsp; CONFIDENCE SCORE: {prediction.confidence*100:.1f}%", banner_style)
    ]]
    t_banner = Table(banner_data, colWidths=[520])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 20))

    # Soil and Weather Analysis
    story.append(Paragraph("Soil and Environmental Parameters", h2_style))
    analysis_data = [
        [Paragraph("<b>Soil Factor</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Environmental Factor</b>", body_style), Paragraph("<b>Value</b>", body_style)],
        [Paragraph("Nitrogen (N)", body_style), Paragraph(f"{prediction.nitrogen} mg/kg", body_style), Paragraph("Temperature", body_style), Paragraph(f"{prediction.temperature} °C", body_style)],
        [Paragraph("Phosphorus (P)", body_style), Paragraph(f"{prediction.phosphorus} mg/kg", body_style), Paragraph("Humidity", body_style), Paragraph(f"{prediction.humidity} %", body_style)],
        [Paragraph("Potassium (K)", body_style), Paragraph(f"{prediction.potassium} mg/kg", body_style), Paragraph("Rainfall", body_style), Paragraph(f"{prediction.rainfall} mm", body_style)],
        [Paragraph("Soil pH", body_style), Paragraph(f"{prediction.ph}", body_style), Paragraph("-", body_style), Paragraph("-", body_style)]
    ]
    t_analysis = Table(analysis_data, colWidths=[150, 110, 150, 110])
    t_analysis.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#CBD5E1")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(t_analysis)
    story.append(Spacer(1, 20))

    # Fertilizer Schedule Recommendation
    story.append(Paragraph("Nutrient Deficit and Fertilizer Plan", h2_style))
    
    # Calculate fertilizer recommendation locally (copied logic from predictions blueprint)
    from backend.app.predictions import calculate_fertilizer
    fert_res = calculate_fertilizer(prediction.nitrogen, prediction.phosphorus, prediction.potassium, prediction.ph, prediction.crop)
    
    fertilizers = fert_res['fertilizers']
    ph_advice = fert_res['ph_advice']

    fert_rows = [[Paragraph("<b>Fertilizer Name</b>", body_style), Paragraph("<b>Quantity</b>", body_style), Paragraph("<b>Application Method</b>", body_style)]]
    for f in fertilizers:
        fert_rows.append([
            Paragraph(f['name'], body_style),
            Paragraph(f['quantity'], body_style),
            Paragraph(f"{f['schedule']}<br/><i>Method: {f['method']}</i>", body_style)
        ])
        
    t_fert = Table(fert_rows, colWidths=[120, 100, 300])
    t_fert.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#CBD5E1")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t_fert)
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<b>pH Amendment Advice:</b> {ph_advice}", body_style))
    story.append(Spacer(1, 20))

    # Smart Irrigation Schedule
    story.append(Paragraph("Smart Irrigation Plan", h2_style))
    from backend.app.predictions import calculate_irrigation
    irr_res = calculate_irrigation(prediction.temperature, prediction.humidity, prediction.rainfall, prediction.crop)

    irrigation_data = [
        [Paragraph("<b>Daily Water Requirement</b>", body_style), Paragraph(f"{irr_res['daily_water_requirement_liters']} Liters/Acre", body_style)],
        [Paragraph("<b>Weekly Water Requirement</b>", body_style), Paragraph(f"{irr_res['weekly_water_requirement_liters']} Liters/Acre", body_style)],
        [Paragraph("<b>Irrigation Frequency</b>", body_style), Paragraph(irr_res['irrigation_frequency'], body_style)],
        [Paragraph("<b>Watering Schedule</b>", body_style), Paragraph(irr_res['watering_schedule'], body_style)]
    ]
    t_irr = Table(irrigation_data, colWidths=[200, 320])
    t_irr.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(t_irr)
    
    doc.build(story)

@reports_bp.route('/download/<int:prediction_id>', methods=['GET'])
@jwt_required()
def download_report(prediction_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return jsonify({'message': 'Prediction record not found'}), 404

    # Setup report paths
    filename = f"report_prediction_{prediction_id}.pdf"
    reports_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'reports')
    pdf_path = os.path.join(reports_dir, filename)

    try:
        # Build PDF if it doesn't exist
        build_pdf_report(pdf_path, prediction, user)
        
        # Save record to Reports table if not already saved
        report_record = Report.query.filter_by(prediction_id=prediction_id, user_id=user_id).first()
        if not report_record:
            report_record = Report(
                user_id=user_id,
                prediction_id=prediction_id,
                report_path=filename
            )
            db.session.add(report_record)
            db.session.commit()
            
        return send_file(pdf_path, as_attachment=True, download_name=f"AgroMind_Report_{prediction.crop.capitalize()}_{prediction_id}.pdf")
    except Exception as e:
        return jsonify({'message': f"Failed to generate report: {str(e)}"}), 500
