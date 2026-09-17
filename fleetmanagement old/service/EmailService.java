package com.zemenbank.fleetmanagement.service;



import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.activation.DataSource;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("asmarestu12@gmail.com"); 
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (MailException e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
        
    }
    public void sendEmailWithPdfAttachment(String to, String subject, String body, byte[] pdfData, String pdfName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("asmarestu12@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            DataSource dataSource = new ByteArrayDataSource(pdfData, "application/pdf");
            helper.addAttachment(pdfName, dataSource);

            mailSender.send(message);
            System.out.println("Email with PDF sent to: " + to);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Failed to send email with PDF: " + e.getMessage());
        }
    }
    
}