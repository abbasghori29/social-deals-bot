from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta

app = Flask(__name__)

# Simulate database with hardcoded time slots
# Structure: {date: [list of available times]}
AVAILABLE_SLOTS = {
    "2024-11-10": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-11": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-12": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-13": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-14": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-15": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-16": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-17": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-18": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-19": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    "2024-11-20": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
}

# Store bookings (in memory - in a real application, this would be in a database)
BOOKED_SLOTS = set()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/get-time-slots', methods=['POST'])
def get_time_slots():
    try:
        data = request.get_json()
        if not data or 'selectedDate' not in data:
            return jsonify({'error': 'Selected date is required'}), 400
            
        selected_date = data['selectedDate']
        schedule_type = data.get('scheduleType', 'sooner')
        
        # Check if we have slots for the selected date
        if selected_date not in AVAILABLE_SLOTS:
            return jsonify([])  # Return empty list if no slots for that date
            
        # Get available times for the selected date
        available_times = AVAILABLE_SLOTS[selected_date]
        
        # Create slots list with availability check
        slots = []
        for time in available_times:
            datetime_str = f"{selected_date} {time}"
            slots.append({
                'datetime': datetime_str,
                'available': datetime_str not in BOOKED_SLOTS
            })
            
        return jsonify(slots)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/book-slot', methods=['POST'])
def book_slot():
    try:
        data = request.get_json()
        if not data or 'slot' not in data or 'userInfo' not in data:
            return jsonify({'error': 'Missing required data'}), 400
            
        slot = data['slot']
        user_info = data['userInfo']
        
        # Check if slot exists and is not booked
        slot_date = slot.split()[0]
        slot_time = slot.split()[1]
        
        if (slot_date not in AVAILABLE_SLOTS or 
            slot_time not in AVAILABLE_SLOTS[slot_date] or 
            slot in BOOKED_SLOTS):
            return jsonify({
                'success': False,
                'message': 'Slot is not available'
            })
            
        # Book the slot
        BOOKED_SLOTS.add(slot)
        AVAILABLE_SLOTS[slot_date].remove(slot_time)  

        
        return jsonify({
            'success': True,
            'message': 'Booking confirmed',
            'slot': slot,
            'userInfo': user_info
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)