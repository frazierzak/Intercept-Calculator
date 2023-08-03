from flask import Flask, request, render_template, jsonify
import math

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def calculate_heading():
    if request.method == 'POST':
        # get values from form
        speed_self = request.form.get('speed_self')
        speed_target = request.form.get('speed_target')
        direction_target_from_you = request.form.get('direction_target_from_you')
        direction_target_heading = request.form.get('direction_target_heading')
        distance_target = request.form.get('distance_target')

        if request.form.get('clear'):
            # clear form
            return jsonify({})

        if not speed_self or not speed_target or not direction_target_from_you or not direction_target_heading or not distance_target:
            return render_template('form.html', error='All fields are required.')

        # convert to float
        speed_self = float(speed_self)
        speed_target = float(speed_target)
        direction_target_from_you = float(direction_target_from_you)
        direction_target_heading = float(direction_target_heading)
        distance_target = float(distance_target)

        # calculate
        time_to_target = distance_target / speed_self
        distance_moved_target = speed_target * time_to_target

        # convert game angles (clockwise from north) to mathematical angles (counter-clockwise from east)
        angle_target = 90 - direction_target_from_you
        if angle_target < 0:
            angle_target += 360

        angle_movement = 90 - direction_target_heading
        if angle_movement < 0:
            angle_movement += 360

        # convert angles from degrees to radians for math functions
        angle_target = math.radians(angle_target)
        angle_movement = math.radians(angle_movement)

        # initial target position in Cartesian coordinates
        x_target = distance_target * math.cos(angle_target)
        y_target = distance_target * math.sin(angle_target)

        # movement of the target in Cartesian coordinates
        x_movement = distance_moved_target * math.cos(angle_movement)
        y_movement = distance_moved_target * math.sin(angle_movement)

        # final position
        x_final = x_target + x_movement
        y_final = y_target + y_movement

        # convert back to polar
        distance_final = math.sqrt(x_final**2 + y_final**2)
        angle_final = math.atan2(y_final, x_final)
        angle_final = math.degrees(angle_final)  # convert to degrees

        # convert mathematical angle (counter-clockwise from east) back to game angle (clockwise from north)
        angle_final = 90 - angle_final
        if angle_final < 0:
            angle_final += 360

        # calculate time to intercept
        time_to_intercept = distance_final / speed_self

        # round the results
        angle_final = round(angle_final, 0)  # direction rounding to zero decimals
        distance_final = round(distance_final, 0)  # distance rounding to one decimal
        time_to_intercept = round(time_to_intercept, 1)  # time rounding to one decimal

        # Return the results as JSON data
        result_data = {
            'angle_final': angle_final,
            'distance_final': distance_final,
            'time_to_intercept': time_to_intercept
        }

        return jsonify(result_data)

    return render_template('form.html')

if __name__ == "__main__":
    app.run(debug=True)
