#!/bin/bash

echo "Starting FIDES Mentorship System Services..."

# Function to check if a process is running
check_process() {
    if pgrep -f "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Start backend if not running
if ! check_process "nest start --watch"; then
    echo "Starting backend..."
    cd /home/blizzarddown/Escritorio/fidesapp/fides-mentorship-system/backend
    npm run start:dev > /tmp/backend.log 2>&1 &
    echo "Backend started on http://localhost:3001"
else
    echo "Backend already running"
fi

# Start frontend if not running
if ! check_process "next dev"; then
    echo "Starting frontend..."
    cd /home/blizzarddown/Escritorio/fidesapp/fides-mentorship-system/frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    echo "Frontend started on http://localhost:3000"
else
    echo "Frontend already running"
fi

echo ""
echo "Services running:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001/api"
echo ""
echo "To stop services, run: pkill -f 'nest start' && pkill -f 'next dev'"