import os
from typing import Dict, List, Optional, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/forms.body',
          'https://www.googleapis.com/auth/forms.responses.readonly']


class GoogleFormsService:
    """Service for interacting with Google Forms API"""
    
    def __init__(self):
        self.service = None
        self.credentials = None
        
    async def authenticate(self, credentials_file: str = None, token_file: str = None):
        """
        Authenticate with Google Forms API
        
        Args:
            credentials_file: Path to credentials.json file
            token_file: Path to token.json file for stored credentials
        """
        creds = None
        
        # Default file paths
        if not credentials_file:
            credentials_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        if not token_file:
            token_file = os.getenv("GOOGLE_TOKEN_FILE", "token.json")
        
        # The file token.json stores the user's access and refresh tokens.
        if os.path.exists(token_file):
            creds = Credentials.from_authorized_user_file(token_file, SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(credentials_file):
                    raise Exception(f"Google credentials file not found: {credentials_file}")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_file, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(token_file, 'w') as token:
                token.write(creds.to_json())
        
        self.credentials = creds
        self.service = build('forms', 'v1', credentials=creds)
        
    def create_form(self, title: str, description: str = "") -> Dict[str, Any]:
        """
        Create a new Google Form
        
        Args:
            title: Form title
            description: Form description
            
        Returns:
            Dict containing form information including form_id and form_url
        """
        if not self.service:
            raise Exception("Google Forms service not authenticated. Call authenticate() first.")
        
        try:
            # Create the form
            form = {
                "info": {
                    "title": title,
                    "description": description
                }
            }
            
            result = self.service.forms().create(body=form).execute()
            
            # Extract form information
            form_id = result.get('formId')
            form_url = result.get('responderUri')
            
            return {
                'form_id': form_id,
                'form_url': form_url,
                'title': title,
                'description': description,
                'created': True
            }
            
        except HttpError as error:
            print(f'An error occurred creating form: {error}')
            raise Exception(f"Failed to create Google Form: {error}")
    
    def add_text_question(self, form_id: str, question_text: str, required: bool = False) -> Dict[str, Any]:
        """
        Add a text question to an existing form
        
        Args:
            form_id: Google Form ID
            question_text: The question text
            required: Whether the question is required
            
        Returns:
            Dict containing question information
        """
        if not self.service:
            raise Exception("Google Forms service not authenticated. Call authenticate() first.")
        
        try:
            # Create the question
            new_question = {
                "requests": [{
                    "createItem": {
                        "item": {
                            "title": question_text,
                            "questionItem": {
                                "question": {
                                    "required": required,
                                    "textQuestion": {
                                        "paragraph": False
                                    }
                                }
                            }
                        },
                        "location": {
                            "index": 0
                        }
                    }
                }]
            }
            
            # Add question to form
            result = self.service.forms().batchUpdate(
                formId=form_id, body=new_question).execute()
            
            return {
                'question_added': True,
                'question_text': question_text,
                'required': required
            }
            
        except HttpError as error:
            print(f'An error occurred adding question: {error}')
            raise Exception(f"Failed to add question to form: {error}")
    
    def create_lead_capture_form(self, title: str, description: str = "") -> Dict[str, Any]:
        """
        Create a standardized lead capture form with common fields
        
        Args:
            title: Form title
            description: Form description
            
        Returns:
            Dict containing complete form information
        """
        try:
            # Create the base form
            form_info = self.create_form(title, description)
            form_id = form_info['form_id']
            
            # Add standard lead capture questions
            questions = [
                {"text": "Nome Completo", "required": True},
                {"text": "Telefone (WhatsApp)", "required": True},
                {"text": "E-mail", "required": False},
                {"text": "Como podemos ajudá-lo?", "required": False}
            ]
            
            for question in questions:
                self.add_text_question(
                    form_id, 
                    question["text"], 
                    question["required"]
                )
            
            return {
                **form_info,
                'questions_added': len(questions),
                'standard_lead_form': True
            }
            
        except Exception as error:
            print(f'Error creating lead capture form: {error}')
            raise Exception(f"Failed to create lead capture form: {error}")
    
    def get_form_responses(self, form_id: str) -> List[Dict[str, Any]]:
        """
        Get all responses for a form
        
        Args:
            form_id: Google Form ID
            
        Returns:
            List of form responses
        """
        if not self.service:
            raise Exception("Google Forms service not authenticated. Call authenticate() first.")
        
        try:
            # Get form responses
            result = self.service.forms().responses().list(formId=form_id).execute()
            responses = result.get('responses', [])
            
            # Get form structure to map question IDs to question text
            form = self.service.forms().get(formId=form_id).execute()
            items = form.get('items', [])
            
            # Create question mapping
            question_map = {}
            for item in items:
                if 'questionItem' in item:
                    question_id = item['questionItem']['question']['questionId']
                    question_title = item.get('title', 'Unknown Question')
                    question_map[question_id] = question_title
            
            # Process responses
            processed_responses = []
            for response in responses:
                response_data = {
                    'response_id': response.get('responseId'),
                    'create_time': response.get('createTime'),
                    'last_submitted_time': response.get('lastSubmittedTime'),
                    'answers': {}
                }
                
                # Process answers
                answers = response.get('answers', {})
                for question_id, answer_data in answers.items():
                    question_title = question_map.get(question_id, question_id)
                    
                    # Extract text answers
                    text_answers = answer_data.get('textAnswers', {})
                    if text_answers and 'answers' in text_answers:
                        answer_values = [ans.get('value', '') for ans in text_answers['answers']]
                        response_data['answers'][question_title] = answer_values[0] if len(answer_values) == 1 else answer_values
                
                processed_responses.append(response_data)
            
            return processed_responses
            
        except HttpError as error:
            print(f'An error occurred getting responses: {error}')
            raise Exception(f"Failed to get form responses: {error}")
    
    def process_responses_to_leads(self, form_id: str, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process Google Form responses into lead data structure
        
        Args:
            form_id: Google Form ID
            responses: List of form responses
            
        Returns:
            List of lead data dictionaries ready for database insertion
        """
        leads = []
        
        for response in responses:
            answers = response.get('answers', {})
            
            # Extract standard fields (flexible matching)
            first_name = ""
            phone = ""
            email = ""
            
            # Try to match common field patterns
            for question, answer in answers.items():
                question_lower = question.lower()
                
                if any(keyword in question_lower for keyword in ['nome', 'name']):
                    first_name = str(answer) if answer else ""
                elif any(keyword in question_lower for keyword in ['telefone', 'phone', 'whatsapp']):
                    phone = str(answer) if answer else ""
                elif any(keyword in question_lower for keyword in ['email', 'e-mail']):
                    email = str(answer) if answer else ""
            
            # Only create lead if we have minimum required data
            if first_name and phone:
                lead_data = {
                    'form_id': form_id,
                    'first_name': first_name,
                    'phone': phone,
                    'responses': answers
                }
                
                if email:
                    lead_data['email'] = email
                
                leads.append(lead_data)
        
        return leads


# Singleton instance
google_forms_service = GoogleFormsService()


# Helper functions for easy use
async def create_google_form(title: str, description: str = "") -> Dict[str, Any]:
    """Create a Google Form with authentication check"""
    try:
        if not google_forms_service.service:
            await google_forms_service.authenticate()
        
        return google_forms_service.create_lead_capture_form(title, description)
    except Exception as e:
        print(f"Error creating Google Form: {e}")
        raise Exception(f"Failed to create Google Form: {str(e)}")


async def get_google_form_responses(form_id: str) -> List[Dict[str, Any]]:
    """Get responses from a Google Form"""
    try:
        if not google_forms_service.service:
            await google_forms_service.authenticate()
        
        return google_forms_service.get_form_responses(form_id)
    except Exception as e:
        print(f"Error getting form responses: {e}")
        raise Exception(f"Failed to get form responses: {str(e)}")


async def sync_form_responses_to_leads(form_id: str) -> List[Dict[str, Any]]:
    """Sync Google Form responses to lead database entries"""
    try:
        # Get responses from Google Forms
        responses = await get_google_form_responses(form_id)
        
        # Process responses into lead format
        leads_data = google_forms_service.process_responses_to_leads(form_id, responses)
        
        return leads_data
    except Exception as e:
        print(f"Error syncing form responses: {e}")
        raise Exception(f"Failed to sync form responses: {str(e)}")